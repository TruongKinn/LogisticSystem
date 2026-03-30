import { Component, Inject, PLATFORM_ID, ChangeDetectorRef, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { AuthService } from '../auth.service';
import { OAuthService } from 'angular-oauth2-oidc';
import { authConfig } from '../auth.config';

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
        NzTabsModule,
        NzToolTipModule
    ],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
    @ViewChild('otpInput') otpInput?: ElementRef;

    loginForm: FormGroup;
    passwordVisible = false;
    isDarkMode = false;
    isBrowser: boolean;
    errorMsg = '';
    isLoading = false;
    requireOtp = false;
    requireCaptcha = false;
    captchaBase64 = '';
    captchaToken = '';

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private notification: NzNotificationService,
        private router: Router,
        private cdr: ChangeDetectorRef,
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

            // Configure OAuth
            this.oauthService.configure(authConfig);
            this.oauthService.setupAutomaticSilentRefresh();

            console.log('LoginComponent: Starting Keycloak discovery loading...');
            this.oauthService.loadDiscoveryDocumentAndTryLogin().then(() => {
                console.log('LoginComponent: Keycloak discovery loaded.');
                console.log('LoginComponent: Identity claims:', this.oauthService.getIdentityClaims());
                console.log('LoginComponent: Access token valid?', this.oauthService.hasValidAccessToken());

                if (this.oauthService.hasValidAccessToken()) {
                    console.log('LoginComponent: Found valid access token, handling callback...');
                    this.handleKeycloakCallback();
                } else {
                    console.log('LoginComponent: No valid access token found.');
                }
            }).catch(err => {
                console.error('LoginComponent: Error loading discovery document', err);
            });
        }
    }

    ngOnInit(): void {
        // Check if returning from Keycloak (redundant check, but safe)
        if (this.isBrowser && this.oauthService.hasValidAccessToken()) {
            console.log('ngOnInit: Valid token found, handling callback...');
            this.handleKeycloakCallback();
        }
    }

    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        if (this.isBrowser) {
            localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
            this.applyTheme();
        }
    }

    applyTheme() {
        if (this.isDarkMode) {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
    }

    refreshCaptcha(): void {
        this.isLoading = true;
        this.authService.getCaptcha().subscribe({
            next: (res) => {
                this.isLoading = false;
                this.captchaToken = res.captchaToken;
                this.captchaBase64 = res.base64Image;
                this.loginForm.get('captchaAnswer')?.setValue('');
            },
            error: (err) => {
                this.isLoading = false;
                this.notification.error('Lỗi', 'Không thể tải mã CAPTCHA: ' + (err.error?.message || err.message || ''));
            }
        });
    }

    loginWithKeycloak(): void {
        this.oauthService.initCodeFlow();
    }

    handleKeycloakCallback(): void {
        const keycloakToken = this.oauthService.getAccessToken();
        if (keycloakToken) {
            this.isLoading = true;
            this.authService.exchangeKeycloakToken(keycloakToken).subscribe({
                next: (res) => {
                    this.isLoading = false;
                    this.notification.success('Đăng nhập thành công', 'Chào mừng bạn quay trở lại!');
                    this.router.navigate(['/']);
                },
                error: (err) => {
                    this.isLoading = false;
                    this.notification.error('Đăng nhập thất bại', err.error?.message || 'Không thể xác thực với Keycloak');
                }
            });
        }
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
            deviceToken: 'web-device'
        };

        // Add OTP if provided
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
                console.log('Response nhận được:', res);

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

                    this.errorMsg = errorMessage.includes('Invalid') ? 'Mã CAPTCHA không hợp lệ. Vui lòng nhập lại.' : 'Vui lòng xác nhận CAPTCHA.';
                } else if (errorMessage.includes('OTP is required') ||
                    errorMessage.includes('OTP code') ||
                    (res.status === 401 && !errorMessage.includes('Bad credentials'))) {

                    this.requireOtp = true;
                    this.loginForm.get('otp')?.setValidators([Validators.required, Validators.pattern(/^\d{6}$/)]);
                    this.loginForm.get('otp')?.updateValueAndValidity();

                    this.notification.warning(
                        'Yêu cầu xác thực 2 bước',
                        'Tài khoản này đã bật 2FA. Vui lòng nhập mã OTP từ Google Authenticator.',
                        { nzPlacement: 'topRight', nzDuration: 5000 }
                    );
                    this.cdr.detectChanges();

                    setTimeout(() => {
                        if (this.otpInput) {
                            this.otpInput.nativeElement.focus();
                        }
                    }, 100);
                } else if (res.accessToken) {
                    this.notification.success('Đăng nhập thành công', 'Chào mừng bạn quay trở lại!');
                    this.router.navigate(['/']);
                } else {
                    this.errorMsg = errorMessage || 'Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản.';
                    this.notification.error('Đăng nhập thất bại', this.errorMsg);

                    if (this.requireCaptcha) {
                        this.refreshCaptcha();
                    }
                }
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.isLoading = false;
                const errorMessage = err.error?.message || err.message || (typeof err === 'string' ? err : '');

                this.errorMsg = errorMessage || 'Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản.';
                this.notification.error('Đăng nhập thất bại', this.errorMsg);

                if (this.requireCaptcha) {
                    this.refreshCaptcha();
                }
                this.cdr.detectChanges();
            }
        });
    }
}
