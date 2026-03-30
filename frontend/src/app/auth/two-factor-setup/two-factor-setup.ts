import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
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
import { TwoFactorService } from '../two-factor.service';
import { DomSanitizer, SafeUrl, SafeResourceUrl } from '@angular/platform-browser';
import { API_CONFIG } from '../../shared/constants/api.constant';

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
  secret: string = '';
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
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
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

  ngOnInit(): void {
    this.checkStatus();
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
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Check status error', err);
        this.generateQRCode(); // Fallback to setup
      }
    });
  }

  generateQRCode(): void {
    this.isLoading = true;
    this.twoFactorService.generateSecret().subscribe({
      next: (response) => {
        console.log('Generate 2FA response:', response);
        this.secret = response.secret;
        this.qrCodeUrl = this.sanitizer.bypassSecurityTrustUrl(response.qrCodeUrl);
        this.step = 'verify';
        this.isLoading = false;
        this.cdr.detectChanges();
        console.log('State updated: isLoading=', this.isLoading, 'step=', this.step);
      },
      error: (err) => {
        this.message.error('Không thể tạo mã QR. Vui lòng thử lại.');
        this.isLoading = false;
        console.error('Generate QR error', err);
      }
    });
  }

  verifyOtp(): void {
    if (this.setupForm.valid) {
      this.isLoading = true;
      const otp = this.setupForm.value.otp;

      this.twoFactorService.verifyAndEnable(otp).subscribe({
        next: (response) => {
          this.message.success('Bật 2FA thành công!');
          this.is2faEnabled = true;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.message.error('Mã OTP không đúng. Vui lòng thử lại.');
          this.isLoading = false;
          this.cdr.detectChanges();
          console.error('Verify OTP error', err);
        }
      });
    } else {
      Object.values(this.setupForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  disable2fa(): void {
    this.isLoading = true;
    this.twoFactorService.disable().subscribe({
      next: () => {
        this.message.success('Tắt 2FA thành công!');
        this.is2faEnabled = false;
        this.generateQRCode(); // Show setup again
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.message.error('Không thể tắt 2FA. Vui lòng thử lại.');
        this.isLoading = false;
        this.cdr.detectChanges();
        console.error('Disable 2FA error', err);
      }
    });
  }

  showInstruction(): void {
    this.instructionUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`${API_CONFIG.GATEWAY_URL}/auth/2fa/instruction#view=FitH`);
    this.isVisibleGuide = true;
  }

  handleCancelGuide(): void {
    this.isVisibleGuide = false;
  }
}
