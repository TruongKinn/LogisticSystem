import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NotificationService } from '../../shared/services/notification.service';
import { Notification } from '../../shared/models/notification.model';

@Component({
    selector: 'app-notification-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        NzTableModule,
        NzButtonModule,
        NzIconModule,
        NzInputModule,
        NzBreadCrumbModule,
        NzTagModule,
        NzToolTipModule,
        NzDividerModule,
        NzPaginationModule,
        NzModalModule,
        NzFormModule
    ],
    templateUrl: './notification-list.component.html',
    styleUrls: ['./notification-list.component.css']
})
export class NotificationListComponent implements OnInit {
    notifications: Notification[] = [];
    loading = false;
    pageIndex = 1;
    pageSize = 10;
    total = 0;
    Math = Math;

    isModalVisible = false;
    isSending = false;
    validateForm!: FormGroup;

    constructor(
        private notificationService: NotificationService,
        private msg: NzMessageService,
        private cdr: ChangeDetectorRef,
        private modal: NzModalService,
        private fb: FormBuilder
    ) { }

    ngOnInit(): void {
        this.validateForm = this.fb.group({
            message: [null, [Validators.required]],
            playerId: [null, [Validators.required]]
        });
        this.loadData();
    }

    loadData(): void {
        this.loading = true;
        this.notificationService.getHistory(this.pageIndex, this.pageSize).subscribe({
            next: (response) => {
                this.notifications = response.items;
                this.total = response.total;
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.loading = false;
                this.msg.error('Không thể tải lịch sử thông báo');
                this.cdr.detectChanges();
            }
        });
    }

    onPageIndexChange(index: number): void {
        this.pageIndex = index;
        this.loadData();
    }

    onPageSizeChange(size: number): void {
        this.pageSize = size;
        this.pageIndex = 1;
        this.loadData();
    }

    showModal(): void {
        this.isModalVisible = true;
    }

    handleCancel(): void {
        this.isModalVisible = false;
        this.validateForm.reset();
    }

    handleOk(): void {
        if (this.validateForm.valid) {
            this.isSending = true;
            const { message, playerId } = this.validateForm.value;
            this.notificationService.sendNotification(message, playerId).subscribe({
                next: () => {
                    this.msg.success('Gửi thông báo thành công');
                    this.isSending = false;
                    this.isModalVisible = false;
                    this.validateForm.reset();
                    this.loadData();
                },
                error: (err) => {
                    this.msg.error('Gửi thông báo thất bại: ' + err.message);
                    this.isSending = false;
                }
            });
        } else {
            Object.values(this.validateForm.controls).forEach(control => {
                if (control.invalid) {
                    control.markAsDirty();
                    control.updateValueAndValidity({ onlySelf: true });
                }
            });
        }
    }

    getStatusColor(status: string): string {
        return status === 'SUCCESS' ? 'green' : 'red';
    }

    getProviderTag(provider: string): string {
        return provider === 'ONESIGNAL' ? 'blue' : 'orange';
    }
}
