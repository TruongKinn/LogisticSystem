package vn.agent.service.impl;

import static vn.agent.common.TokenType.REFRESH_TOKEN;

import java.util.List;

import org.apache.commons.lang3.StringUtils;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

import dev.samstevens.totp.code.CodeGenerator;
import dev.samstevens.totp.code.DefaultCodeGenerator;
import dev.samstevens.totp.code.DefaultCodeVerifier;
import dev.samstevens.totp.time.SystemTimeProvider;
import dev.samstevens.totp.time.TimeProvider;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import vn.agent.controller.request.LoginRequest;
import vn.agent.controller.response.TokenResponse;
import vn.agent.exception.UnauthorizedException;
import vn.agent.model.RedisToken;
import vn.agent.repository.TokenRepository;
import vn.agent.repository.UserRepository;
import vn.agent.service.AuthenticationService;
import vn.agent.service.JwtService;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuthenticationServiceImp implements AuthenticationService {

    private final AuthenticationManager authenticationManager;
    private final TokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final org.springframework.data.redis.core.StringRedisTemplate stringRedisTemplate;
    private final vn.agent.service.CaptchaService captchaService;

    @org.springframework.beans.factory.annotation.Value("${spring.keycloak.url}")
    private String keycloakUrl;

    @Override
    public TokenResponse createAccessToken(LoginRequest request) {
        String username = request.getUsername();
        String loginFailKey = "login:fail:" + username;

        String failCountStr = stringRedisTemplate.opsForValue().get(loginFailKey);
        int fails = failCountStr != null ? Integer.parseInt(failCountStr) : 0;

        if (fails >= 3) {
            if (org.apache.commons.lang3.StringUtils.isBlank(request.getCaptchaToken()) ||
                    org.apache.commons.lang3.StringUtils.isBlank(request.getCaptchaAnswer())) {
                throw new vn.agent.exception.UnauthorizedException("REQUIRES_CAPTCHA");
            }
            captchaService.verifyCaptcha(request.getCaptchaToken(), request.getCaptchaAnswer());
        }

        var user = userRepository.findByUsername(username);

        if (user == null) {
            handleLoginFail(loginFailKey, fails);
            throw new vn.agent.exception.UnauthorizedException("Bad credentials");
        }

        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(username,
                    request.getPassword(), user.getAuthorities()));
        } catch (org.springframework.security.core.AuthenticationException ex) {
            handleLoginFail(loginFailKey, fails);
            throw new vn.agent.exception.UnauthorizedException("Bad credentials");
        }

        // Login success, clear fails
        stringRedisTemplate.delete(loginFailKey);

        // Check if 2FA is enabled
        if (user.isTwoFactorEnabled()) {
            if (request.getOtp() == null || request.getOtp().isBlank()) {
                throw new UnauthorizedException("OTP is required for this account");
            }

            // Verify OTP
            TimeProvider timeProvider = new SystemTimeProvider();
            CodeGenerator codeGenerator = new DefaultCodeGenerator();
            DefaultCodeVerifier verifier = new DefaultCodeVerifier(codeGenerator, timeProvider);
            verifier.setAllowedTimePeriodDiscrepancy(1); // Allow 1 time period (30s) drift

            String secret = user.getSecret().trim().toUpperCase();

            // Diagnostic logs
            try {
                long currentBucket = timeProvider.getTime() / 30;
                String expectedCode = codeGenerator.generate(secret, currentBucket);
                log.info("DEBUG OTP: Secret length: {}", secret.length());
                log.info("DEBUG OTP: Expected code for bucket {}: {}", currentBucket, expectedCode);
                log.info("DEBUG OTP: Received code: {}", request.getOtp());
            } catch (Exception e) {
                log.error("DEBUG OTP: Error generating diagnostic log", e);
            }

            boolean isValidOtp = verifier.isValidCode(secret, request.getOtp());
            if (!isValidOtp) {
                throw new UnauthorizedException("Invalid OTP code");
            }
        }

        // generate access token
        String accessToken = jwtService.generateToken(user.getId(), user.getUsername(), user.getFirstName(),
                user.getLastName(), user.getAuthorities());

        // generate refresh token
        String refreshToken = jwtService.generateRefreshToken(user.getId(), user.getUsername(), user.getFirstName(),
                user.getLastName(), user.getAuthorities());

        List<String> roleList = user.getRoles().stream().map(role -> role.getRole().getName()).toList();

        // save token with difference versions (WEB, MOBILE, MiniApp) to DB
        tokenRepository.save(RedisToken.builder()
                .id(request.getUsername())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .flatForm(request.getPlatform().getValue())
                .deviceToken(request.getDeviceToken())
                .roles(roleList.toString())
                .build());

        // TODO how to manage token for multiple devices
        // TODO how to manage authorization for APIs

        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .username(user.getUsername())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .build();
    }

    @Override
    public TokenResponse createRefreshToken(HttpServletRequest request) {
        final String refreshToken = request.getHeader("x-refresh-token");

        if (StringUtils.isBlank(refreshToken)) {
            throw new UnauthorizedException("Token must be not blank");
        }

        final String userName;
        try {
            userName = jwtService.extractUsername(refreshToken, REFRESH_TOKEN);
        } catch (ExpiredJwtException | SignatureException e) {
            throw new UnauthorizedException(e.getMessage());
        }

        var user = userRepository.findByUsername(userName);
        if (user == null) {
            throw new UnauthorizedException("Not allow access with this token");
        }

        // generate access token
        String accessToken = jwtService.generateToken(user.getId(), user.getUsername(), user.getFirstName(),
                user.getLastName(), user.getAuthorities());

        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .username(user.getUsername())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .build();
    }

    @Override
    public TokenResponse exchangeKeycloakToken(vn.agent.controller.request.KeycloakExchangeRequest request) {
        // Validate Keycloak token by calling userinfo endpoint
        String keycloakUserInfoUrl = keycloakUrl + "/realms/micro-services/protocol/openid-connect/userinfo";

        org.springframework.web.reactive.function.client.WebClient webClient = org.springframework.web.reactive.function.client.WebClient
                .builder().build();

        java.util.Map<String, Object> userInfo;
        try {
            log.info("Validating Keycloak token at: {}", keycloakUserInfoUrl);
            userInfo = webClient.get()
                    .uri(keycloakUserInfoUrl)
                    .header("Authorization", "Bearer " + request.getKeycloakToken())
                    .retrieve()
                    .bodyToMono(
                            new org.springframework.core.ParameterizedTypeReference<java.util.Map<String, Object>>() {
                            })
                    .block();
        } catch (Exception e) {
            log.error("Failed to validate Keycloak token at {}: {}", keycloakUserInfoUrl, e.getMessage());
            throw new UnauthorizedException("Invalid Keycloak token: " + e.getMessage());
        }

        if (userInfo == null) {
            throw new UnauthorizedException("Invalid Keycloak token");
        }

        // Extract username from Keycloak userinfo
        String username = (String) userInfo.get("preferred_username");
        if (username == null) {
            username = (String) userInfo.get("email");
        }

        if (username == null) {
            throw new UnauthorizedException("Cannot extract username from Keycloak token");
        }

        // Find user in local database
        var user = userRepository.findByUsername(username);
        if (user == null) {
            throw new UnauthorizedException("User not found in system: " + username);
        }

        // Generate internal tokens
        String accessToken = jwtService.generateToken(user.getId(), user.getUsername(), user.getFirstName(),
                user.getLastName(), user.getAuthorities());

        String refreshToken = jwtService.generateRefreshToken(user.getId(), user.getUsername(), user.getFirstName(),
                user.getLastName(), user.getAuthorities());

        List<String> roleList = user.getRoles().stream().map(role -> role.getRole().getName()).toList();

        // Save token to Redis
        tokenRepository.save(vn.agent.model.RedisToken.builder()
                .id(request.getKeycloakToken().substring(0, Math.min(50, request.getKeycloakToken().length())))
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .flatForm(request.getPlatform())
                .deviceToken(request.getDeviceToken())
                .roles(roleList.toString())
                .build());

        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .username(user.getUsername())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .build();
    }

    private void handleLoginFail(String loginFailKey, int currentFails) {
        currentFails++;
        stringRedisTemplate.opsForValue().set(loginFailKey, String.valueOf(currentFails),
                java.time.Duration.ofMinutes(15));
    }
}
