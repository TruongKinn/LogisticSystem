import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { OAuthService } from 'angular-oauth2-oidc';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { AuthService } from '../auth.service';
import { authConfig } from '../auth.config';

type AuthMode = 'bearer' | 'keycloak';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterLink,
        NzFormModule,
        NzInputModule,
        NzButtonModule,
        NzCheckboxModule,
        NzAlertModule,
        NzIconModule,
        NzModalModule,
        NzToolTipModule
    ],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
    @ViewChild('otpInput') otpInput?: ElementRef<HTMLInputElement>;

    loginForm: FormGroup;
    authMode: AuthMode = 'bearer';
    passwordVisible = false;
    isDarkMode = false;
    isBrowser: boolean;
    errorMsg = '';
    isLoading = false;
    requireOtp = false;
    requireCaptcha = false;
    captchaBase64 = '';
    captchaToken = '';
    isVisibleTwoFactorGuide = false;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private notification: NzNotificationService,
        private router: Router,
        private oauthService: OAuthService,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
        this.isBrowser = isPlatformBrowser(this.platformId);
        this.loginForm = this.fb.group({
            username: ['', [Validators.required]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            otp: [''],
            captchaAnswer: [''],
            remember: [true]
        });

        if (this.isBrowser) {
            const savedTheme = localStorage.getItem('theme');
            this.isDarkMode = savedTheme === 'dark';
            this.applyTheme();

            this.oauthService.configure(authConfig);
            this.oauthService.setupAutomaticSilentRefresh();

            this.oauthService.loadDiscoveryDocumentAndTryLogin().then(() => {
                if (this.oauthService.hasValidAccessToken()) {
                    setTimeout(() => this.handleKeycloakCallback(), 0);
                }
            }).catch(() => {
                // Keycloak discovery is optional for the bearer flow.
            });
        }
    }

    ngOnInit(): void {
        if (this.isBrowser && this.authService.isAuthenticated()) {
            this.router.navigate(['/']);
        }
    }

    selectAuthMode(mode: AuthMode): void {
        this.authMode = mode;
        this.errorMsg = '';
        this.resetChallengeState();
    }

    toggleTheme(): void {
        this.isDarkMode = !this.isDarkMode;
        if (this.isBrowser) {
            localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
            this.applyTheme();
        }
    }

    applyTheme(): void {
        if (!this.isBrowser) {
            return;
        }

        if (this.isDarkMode) {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
    }

    private resetChallengeState(): void {
        this.requireOtp = false;
        this.requireCaptcha = false;
        this.captchaBase64 = '';
        this.captchaToken = '';

        const otpControl = this.loginForm.get('otp');
        otpControl?.clearValidators();
        otpControl?.reset('');
        otpControl?.updateValueAndValidity({ onlySelf: true });

        const captchaControl = this.loginForm.get('captchaAnswer');
        captchaControl?.clearValidators();
        captchaControl?.reset('');
        captchaControl?.updateValueAndValidity({ onlySelf: true });
    }

    refreshCaptcha(): void {
        this.isLoading = true;
        this.authService.getCaptcha().subscribe({
            next: (res) => {
                this.isLoading = false;
                this.captchaToken = res.captchaToken;
                this.captchaBase64 = res.base64Image;
                this.loginForm.get('captchaAnswer')?.reset('');
            },
            error: (err) => {
                this.isLoading = false;
                this.notification.error('Lỗi', 'Không thể tải CAPTCHA: ' + (err.error?.message || err.message || ''));
            }
        });
    }

    loginWithKeycloak(): void {
        this.isLoading = true;
        this.errorMsg = '';
        this.oauthService.initCodeFlow();
    }

    openTwoFactorGuide(): void {
        this.isVisibleTwoFactorGuide = true;
    }

    closeTwoFactorGuide(): void {
        this.isVisibleTwoFactorGuide = false;
    }

    openTwoFactorSetup(): void {
        if (this.authService.isAuthenticated()) {
            this.router.navigate(['/2fa-setup']);
            return;
        }

        this.openTwoFactorGuide();
    }

    handleKeycloakCallback(): void {
        const keycloakToken = this.oauthService.getAccessToken();
        if (!keycloakToken) {
            this.isLoading = false;
            return;
        }

        this.isLoading = true;
        this.authService.exchangeKeycloakToken(keycloakToken).subscribe({
            next: () => {
                this.isLoading = false;
                this.resetChallengeState();
                this.notification.success('Đăng nhập thành công', 'Chào mừng bạn quay trở lại!');
                this.router.navigateByUrl('/', { replaceUrl: true });
            },
            error: (err) => {
                this.isLoading = false;
                const message = err.error?.message || 'Không thể xác thực với Keycloak';
                setTimeout(() => {
                    this.errorMsg = message;
                });
                this.notification.error('Đăng nhập thất bại', message);
            }
        });
    }

    submitForm(): void {
        if (this.loginForm.invalid) {
            Object.values(this.loginForm.controls).forEach(control => {
                control.markAsDirty();
                control.updateValueAndValidity({ onlySelf: true });
            });
            return;
        }

        this.isLoading = true;
        this.errorMsg = '';

        const loginData: any = {
            username: this.loginForm.value.username,
            password: this.loginForm.value.password,
            platform: 'web',
            deviceToken: 'web-device',
            remember: this.loginForm.value.remember
        };

        if (this.requireOtp && this.loginForm.value.otp) {
            loginData.otp = this.loginForm.value.otp;
        }

        if (this.requireCaptcha) {
            loginData.captchaToken = this.captchaToken;
            loginData.captchaAnswer = this.loginForm.value.captchaAnswer;
        }

        this.authService.login(loginData).subscribe({
            next: (res) => {
                this.isLoading = false;
                const errorMessage = res.error?.message || res.message || (typeof res === 'string' ? res : '');

                if (errorMessage.includes('REQUIRES_CAPTCHA') || errorMessage.includes('CAPTCHA')) {
                    this.requireCaptcha = true;
                    this.refreshCaptcha();
                    this.loginForm.get('captchaAnswer')?.setValidators([Validators.required]);
                    this.loginForm.get('captchaAnswer')?.updateValueAndValidity();

                    this.notification.warning(
                        'Yêu cầu xác nhận CAPTCHA',
                        'Mật khẩu sai nhiều lần. Vui lòng nhập mã CAPTCHA để tiếp tục.',
                        { nzPlacement: 'topRight', nzDuration: 5000 }
                    );

                    this.errorMsg = errorMessage.includes('Invalid')
                        ? 'Mã CAPTCHA không hợp lệ. Vui lòng nhập lại.'
                        : 'Vui lòng xác nhận CAPTCHA.';
                } else if (
                    errorMessage.includes('OTP is required') ||
                    errorMessage.includes('OTP code') ||
                    (res.status === 401 && !errorMessage.includes('Bad credentials'))
                ) {
                    this.requireOtp = true;
                    this.loginForm.get('otp')?.setValidators([Validators.required, Validators.pattern(/^\d{6}$/)]);
                    this.loginForm.get('otp')?.updateValueAndValidity();

                    this.notification.warning(
                        'Yêu cầu xác thực 2 bước',
                        'Tài khoản này đã bật 2FA. Vui lòng nhập mã OTP từ Google Authenticator.',
                        { nzPlacement: 'topRight', nzDuration: 5000 }
                    );

                    setTimeout(() => {
                        this.otpInput?.nativeElement.focus();
                    }, 100);
                } else if (res.accessToken) {
                    this.resetChallengeState();
                    this.notification.success('Đăng nhập thành công', 'Chào mừng bạn quay trở lại!');
                    this.router.navigateByUrl('/', { replaceUrl: true });
                } else {
                    const fallbackMessage = errorMessage || 'Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản.';
                    setTimeout(() => {
                        this.errorMsg = fallbackMessage;
                    });
                    this.notification.error('Đăng nhập thất bại', fallbackMessage);

                    if (this.requireCaptcha) {
                        this.refreshCaptcha();
                    }
                }

            },
            error: (err) => {
                this.isLoading = false;
                const errorMessage = err.error?.message || err.message || (typeof err === 'string' ? err : '');

                if (
                    errorMessage.includes('OTP is required') ||
                    errorMessage.includes('OTP code') ||
                    errorMessage.includes('2FA')
                ) {
                    this.requireOtp = true;
                    this.loginForm.get('otp')?.setValidators([Validators.required, Validators.pattern(/^\d{6}$/)]);
                    this.loginForm.get('otp')?.updateValueAndValidity();

                    this.notification.warning(
                        'Yêu cầu xác thực 2 bước',
                        'Tài khoản này đã bật 2FA. Vui lòng nhập mã OTP từ Google Authenticator.',
                        { nzPlacement: 'topRight', nzDuration: 5000 }
                    );

                    setTimeout(() => {
                        this.otpInput?.nativeElement.focus();
                    }, 100);
                }

                const fallbackMessage = errorMessage || 'Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản.';
                setTimeout(() => {
                    this.errorMsg = fallbackMessage;
                });
                this.notification.error('Đăng nhập thất bại', fallbackMessage);

                if (this.requireCaptcha) {
                    this.refreshCaptcha();
                }

            }
        });
    }
}
