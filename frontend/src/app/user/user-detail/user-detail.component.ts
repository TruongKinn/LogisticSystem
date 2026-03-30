import { Component, OnInit, Input, Optional, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzUploadModule, NzUploadFile, NzUploadXHRArgs } from 'ng-zorro-antd/upload';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { UserService } from '../../shared/services/user.service';
import { Gender, UserType } from '../../shared/models/user.model';
import { Subscription } from 'rxjs';
import { API_CONFIG } from '../../shared/constants/api.constant';

@Component({
    selector: 'app-user-detail',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        NzFormModule,
        NzInputModule,
        NzButtonModule,
        NzSelectModule,
        NzDatePickerModule,
        NzDatePickerModule,
        NzDatePickerModule,
        NzDatePickerModule,
        NzIconModule,
        NzUploadModule,
        NzAvatarModule
    ],
    templateUrl: './user-detail.component.html',
    styleUrls: ['./user-detail.component.css']
})
export class UserDetailComponent implements OnInit {
    form!: FormGroup;
    @Input() userId: number | null = null;
    @Input() isEditMode = false;
    isLoading = false;
    avatarUrl?: string;
    uploading = false;

    genders = Object.values(Gender);
    userTypes = Object.values(UserType);

    constructor(
        private fb: FormBuilder,
        private userService: UserService,
        private msg: NzMessageService,
        private cdr: ChangeDetectorRef,
        @Optional() private modal: NzModalRef
    ) { }

    ngOnInit(): void {
        if (this.userId) {
            this.isEditMode = true;
        }
        this.initForm();
        if (this.userId) {
            this.loadUser(this.userId);
        }
    }

    initForm(): void {
        this.form = this.fb.group({
            firstName: ['', [Validators.required]],
            lastName: ['', [Validators.required]],
            dateOfBirth: [null, [Validators.required]],
            gender: [Gender.MALE, [Validators.required]],
            phone: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            username: ['', [Validators.required]],
            password: ['', this.isEditMode ? [] : [Validators.required]],
            type: [UserType.USER, [Validators.required]]
        });
    }

    loadUser(id: number): void {
        this.isLoading = true;
        this.userService.getUserDetails(id).subscribe({
            next: (user) => {
                this.form.patchValue({
                    ...user,
                    dateOfBirth: new Date(user.dateOfBirth)
                });
                console.log('User loaded:', user);
                // Assuming the user object has an avatarUrl field now
                if ((user as any).avatarUrl) {
                    this.avatarUrl = `${API_CONFIG.MINIO_URL}/${(user as any).avatarUrl}?t=${new Date().getTime()}`;
                    console.log('Constructed Avatar URL:', this.avatarUrl);
                } else {
                    this.avatarUrl = undefined;
                    console.log('No avatar URL found for user');
                }
                this.isLoading = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.msg.error('Failed to load user details');
                this.isLoading = false;
                this.cdr.detectChanges();
            }
        });
    }

    closeModal(): void {
        this.modal?.destroy();
    }

    submitForm(): void {
        if (this.form.valid) {
            this.isLoading = true;
            const formValue = this.form.value;

            if (this.isEditMode && this.userId) {
                const updateData = { ...formValue, id: this.userId };
                delete updateData.password;
                this.userService.updateUser(updateData).subscribe({
                    next: () => {
                        this.msg.success('User updated successfully');
                        this.modal?.destroy(true); // Close modal and return true
                    },
                    error: () => {
                        this.msg.error('Failed to update user');
                        this.isLoading = false;
                        this.cdr.detectChanges();
                    }
                });
            } else {
                this.userService.addUser(formValue).subscribe({
                    next: () => {
                        this.msg.success('User created successfully');
                        this.modal?.destroy(true); // Close modal and return true
                    },
                    error: () => {
                        this.msg.error('Failed to create user');
                        this.isLoading = false;
                        this.cdr.detectChanges();
                    }
                });
            }
        } else {
            Object.values(this.form.controls).forEach(control => {
                if (control.invalid) {
                    control.markAsDirty();
                    control.updateValueAndValidity({ onlySelf: true });
                }
            });
        }
    }
    handleUpload = (item: NzUploadXHRArgs): Subscription => {
        const file = item.file as any;
        if (!this.userId) {
            return new Subscription();
        }

        this.uploading = true;
        return this.userService.uploadAvatar(this.userId, file).subscribe({
            next: (url) => {
                const fullUrl = `${API_CONFIG.MINIO_URL}/${url}?t=${new Date().getTime()}`;
                console.log('Upload Success URL:', fullUrl);
                this.avatarUrl = fullUrl;

                // Update local storage if this is the current user
                const currentUserId = localStorage.getItem('atg_user_id');
                if (currentUserId && +currentUserId === this.userId) {
                    localStorage.setItem('atg_avatar_url', fullUrl);
                    // Pass the new URL in the event to avoid stale data fetches
                    window.dispatchEvent(new CustomEvent('avatar-updated', { detail: fullUrl }));
                }

                this.msg.success('Avatar uploaded successfully');
                this.uploading = false;
                this.cdr.detectChanges();
                if (item.onSuccess) item.onSuccess(url, item.file, {} as any);
            },
            error: (err) => {
                this.msg.error('Failed to upload avatar');
                this.uploading = false;
                this.cdr.detectChanges();
                if (item.onError) item.onError(err, item.file);
            }
        });
    }
}
