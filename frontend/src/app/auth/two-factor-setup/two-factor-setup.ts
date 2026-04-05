import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { API_CONFIG } from '../../shared/constants/api.constant';
import { TwoFactorService } from '../two-factor.service';

@Component({
  selector: 'app-two-factor-setup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzCardModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzAlertModule,
    NzSpinModule,
    NzIconModule,
    NzModalModule,
    NzBreadCrumbModule
  ],
  templateUrl: './two-factor-setup.html',
  styleUrl: './two-factor-setup.css'
})
export class TwoFactorSetupComponent implements OnInit {
  setupForm: FormGroup;
  qrCodeUrl: SafeUrl | null = null;
  secret = '';
  isLoading = false;
  is2faEnabled = false;
  isDarkMode = false;
  isBrowser: boolean;
  step: 'generate' | 'verify' = 'generate';
  isVisibleGuide = false;
  instructionUrl: SafeResourceUrl | null = null;

  constructor(
    private fb: FormBuilder,
    private twoFactorService: TwoFactorService,
    private message: NzMessageService,
    private sanitizer: DomSanitizer,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.setupForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });

    if (this.isBrowser) {
      const savedTheme = localStorage.getItem('theme');
      this.isDarkMode = savedTheme === 'dark';
      this.applyTheme();
    }
  }

  ngOnInit(): void {
    this.checkStatus();
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    if (this.isBrowser) {
      localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
      this.applyTheme();
    }
  }

  applyTheme(): void {
    if (this.isDarkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }

  checkStatus(): void {
    this.isLoading = true;
    this.twoFactorService.getStatus().subscribe({
      next: (enabled) => {
        this.is2faEnabled = enabled;
        if (!enabled) {
          this.generateQRCode();
        } else {
          this.isLoading = false;
        }
      },
      error: () => {
        this.generateQRCode();
      }
    });
  }

  generateQRCode(): void {
    this.isLoading = true;
    this.twoFactorService.generateSecret().subscribe({
      next: (response) => {
        this.secret = response.secret;
        this.qrCodeUrl = this.sanitizer.bypassSecurityTrustUrl(response.qrCodeUrl);
        this.step = 'verify';
        this.isLoading = false;
      },
      error: () => {
        this.message.error('Không thể tạo mã QR. Vui lòng thử lại.');
        this.isLoading = false;
      }
    });
  }

  verifyOtp(): void {
    if (!this.setupForm.valid) {
      Object.values(this.setupForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    this.isLoading = true;
    const otp = this.setupForm.value.otp;

    this.twoFactorService.verifyAndEnable(otp).subscribe({
      next: () => {
        this.message.success('Bật 2FA thành công!');
        this.is2faEnabled = true;
        this.isLoading = false;
      },
      error: () => {
        this.message.error('Mã OTP không đúng. Vui lòng thử lại.');
        this.isLoading = false;
      }
    });
  }

  disable2fa(): void {
    this.isLoading = true;
    this.twoFactorService.disable().subscribe({
      next: () => {
        this.message.success('Tắt 2FA thành công!');
        this.is2faEnabled = false;
        this.generateQRCode();
      },
      error: () => {
        this.message.error('Không thể tắt 2FA. Vui lòng thử lại.');
        this.isLoading = false;
      }
    });
  }

  showInstruction(): void {
    this.instructionUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      `${API_CONFIG.GATEWAY_URL}/auth/2fa/instruction#view=FitH`
    );
    this.isVisibleGuide = true;
  }

  handleCancelGuide(): void {
    this.isVisibleGuide = false;
  }
}
