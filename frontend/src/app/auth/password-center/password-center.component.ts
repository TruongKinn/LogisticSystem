import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { finalize } from 'rxjs';
import { AuthService } from '../auth.service';
import { MailService } from '../../shared/services/mail.service';
import { UserService } from '../../shared/services/user.service';
import { PwdChangeRequestDTO } from '../../shared/models/user.model';

const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const newPassword = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return newPassword && confirmPassword && newPassword !== confirmPassword ? { passwordMismatch: true } : null;
};

@Component({
    selector: 'app-password-center',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterLink,
        NzCardModule,
        NzTabsModule,
        NzFormModule,
        NzInputModule,
        NzButtonModule,
        NzAlertModule,
        NzIconModule
    ],
    templateUrl: './password-center.component.html',
    styleUrl: './password-center.component.css'
})
export class PasswordCenterComponent implements OnInit {
    private fb = inject(FormBuilder);
    isBrowser: boolean;
    isAuthenticated = false;
    activeTab: 'forgot' | 'change' = 'forgot';
    activeTabIndex = 0;
    forgotLoading = false;
    changeLoading = false;
    forgotDone = false;
    changeDone = false;

    forgotForm = this.fb.group({
        username: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        note: ['']
    });

    changeForm = this.fb.group({
        oldPassword: ['', [Validators.required, Validators.minLength(6)]],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]]
    }, { validators: passwordMatchValidator });

    constructor(
        private authService: AuthService,
        private mailService: MailService,
        private userService: UserService,
        private notification: NzNotificationService,
        @Inject(PLATFORM_ID) platformId: Object
    ) {
        this.isBrowser = isPlatformBrowser(platformId);
    }

    ngOnInit(): void {
        this.isAuthenticated = this.authService.isAuthenticated();
        if (this.isAuthenticated) {
            this.activeTab = 'change';
            this.activeTabIndex = 1;
        }
    }

    switchTab(tab: 'forgot' | 'change'): void {
        this.activeTab = tab;
        this.activeTabIndex = tab === 'change' ? 1 : 0;
    }

    submitForgot(): void {
        if (this.forgotForm.invalid) {
            this.forgotForm.markAllAsTouched();
            return;
        }

        this.forgotLoading = true;
        const username = this.forgotForm.value.username || '';
        const email = this.forgotForm.value.email || '';
        const note = this.forgotForm.value.note || '';
        const subject = 'Yêu cầu khôi phục mật khẩu hệ thống Logistics';
        const body = [
            `Xin chào ${username},`,
            '',
            'Hệ thống đã ghi nhận yêu cầu khôi phục mật khẩu.',
            'Hiện tại màn hình này gửi yêu cầu hỗ trợ qua email vì backend chưa có luồng reset-token hoàn chỉnh.',
            '',
            `Username: ${username}`,
            `Email: ${email}`,
            note ? `Ghi chú: ${note}` : '',
            '',
            'Nếu bạn là quản trị viên, hãy đổi mật khẩu trong màn hình "Đổi mật khẩu" sau khi đăng nhập.',
            `Thời gian: ${new Date().toLocaleString('vi-VN')}`
        ].filter(Boolean).join('\n');

        this.mailService.sendEmail(email, subject, body)
            .pipe(finalize(() => {
                this.forgotLoading = false;
            }))
            .subscribe({
                next: () => {
                    this.forgotDone = true;
                    this.notification.success('Đã gửi yêu cầu', 'Yêu cầu khôi phục đã được gửi qua email.');
                },
                error: (err) => {
                    this.notification.error('Không gửi được', err.error?.message || err.message || 'Vui lòng thử lại sau.');
                }
            });
    }

    submitChange(): void {
        if (this.changeForm.invalid) {
            this.changeForm.markAllAsTouched();
            return;
        }

        const userIdRaw = this.authService.getStoredItem('atg_user_id');
        const userId = Number(userIdRaw);
        if (!userIdRaw || Number.isNaN(userId)) {
            this.notification.warning('Thiếu thông tin tài khoản', 'Bạn cần đăng nhập để đổi mật khẩu.');
            return;
        }

        const payload: PwdChangeRequestDTO = {
            id: userId,
            oldPassword: this.changeForm.value.oldPassword || '',
            newPassword: this.changeForm.value.newPassword || ''
        };

        this.changeLoading = true;
        this.userService.changePassword(payload)
            .pipe(finalize(() => {
                this.changeLoading = false;
            }))
            .subscribe({
                next: () => {
                    this.changeDone = true;
                    this.notification.success('Đổi mật khẩu thành công', 'Mật khẩu đã được cập nhật.');
                    this.changeForm.reset();
                },
                error: (err) => {
                    this.notification.error('Đổi mật khẩu thất bại', err.error?.message || err.message || 'Vui lòng kiểm tra lại thông tin.');
                }
            });
    }
}
