import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { SagaTransaction } from '../../shared/models/saga-transaction.model';

@Component({
    selector: 'app-saga-transaction-detail',
    standalone: true,
    imports: [CommonModule, NzDescriptionsModule, NzTimelineModule, NzTagModule],
    template: `
    <nz-descriptions nzTitle="Thông tin chung" nzBordered [nzColumn]="2">
      <nz-descriptions-item nzTitle="Transaction ID">{{ transaction.id }}</nz-descriptions-item>
      <nz-descriptions-item nzTitle="Mã đơn hàng">{{ transaction.orderId }}</nz-descriptions-item>
      <nz-descriptions-item nzTitle="Trạng thái">
        <nz-tag [nzColor]="getStatusColor(transaction.status)">{{ transaction.status }}</nz-tag>
      </nz-descriptions-item>
      <nz-descriptions-item nzTitle="Ngày tạo">{{ transaction.createdAt | date:'medium' }}</nz-descriptions-item>
    </nz-descriptions>

    <h3 style="margin-top: 24px; margin-bottom: 16px;">Nhật ký giao dịch (Logs)</h3>
    <nz-timeline>
      <nz-timeline-item *ngFor="let log of transaction.logs">{{ log }}</nz-timeline-item>
    </nz-timeline>
  `
})
export class SagaTransactionDetailComponent {
    @Input() transaction!: SagaTransaction;

    getStatusColor(status: string): string {
        switch (status) {
            case 'SUCCESS':
                return 'green';
            case 'STARTED':
            case 'PROCESS_PAYMENT':
            case 'CREATE_ORDER':
            case 'UPDATE_INVENTORY':
                return 'blue';
            case 'FAILED':
            case 'COMPENSATE_FAILED':
                return 'red';
            case 'COMPENSATED':
                return 'orange';
            case 'COMPENSATING':
                return 'gold';
            default:
                return 'default';
        }
    }
}
