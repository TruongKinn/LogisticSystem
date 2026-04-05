import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { LogisticService } from '../../shared/services/logistic.service';

import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzEmptyModule } from 'ng-zorro-antd/empty';

@Component({
    selector: 'app-shipment-detail',
    standalone: true,
    imports: [
        CommonModule,
        DatePipe,
        RouterLink,
        NzCardModule,
        NzDescriptionsModule,
        NzButtonModule,
        NzTagModule,
        NzIconModule,
        NzBreadCrumbModule,
        NzTabsModule,
        NzTimelineModule,
        NzSkeletonModule,
        NzDividerModule,
        NzAvatarModule,
        NzStatisticModule,
        NzToolTipModule,
        NzBadgeModule,
        NzEmptyModule,
    ],
    templateUrl: './shipment-detail.html',
    styles: [`
        .page-container { padding: 24px; background-color: var(--app-bg); min-height: calc(100vh - 64px); }
        .detail-card { width: 100%; border-radius: 12px; margin-bottom: 24px; box-shadow: var(--card-shadow); }
        .header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .page-title { font-size: 22px; font-weight: 700; margin-bottom: 4px; color: var(--text-main); }
        .title-container { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .subtitle { color: #8c8c8c; font-size: 13px; }

        .summary-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px; }
        .summary-card { background: var(--card-bg, #fff); border-radius: 12px; padding: 18px 20px; box-shadow: var(--card-shadow); display: flex; align-items: center; gap: 14px; }
        .summary-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }
        .summary-label { font-size: 12px; color: #8c8c8c; margin-bottom: 4px; }
        .summary-value { font-size: 18px; font-weight: 700; color: var(--text-main, #262626); }

        .info-section-title { font-size: 15px; font-weight: 600; color: var(--text-main); margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
        .info-row { display: flex; justify-content: space-between; align-items: flex-start; padding: 10px 0; border-bottom: 1px solid var(--border-color, #f0f0f0); }
        .info-row:last-child { border-bottom: none; }
        .info-label { color: #8c8c8c; font-size: 13px; flex: 0 0 140px; }
        .info-value { font-size: 13px; font-weight: 500; color: var(--text-main, #262626); text-align: right; flex: 1; word-break: break-word; }

        .assign-card { background: linear-gradient(135deg, #667eea22, #764ba222); border-radius: 12px; padding: 18px; display: flex; align-items: center; gap: 16px; }
        .assign-avatar { font-size: 28px; }
        .assign-name { font-size: 15px; font-weight: 600; }
        .assign-meta { font-size: 12px; color: #8c8c8c; margin-top: 2px; }

        .timeline-container { padding: 8px 0; }
        .timeline-title { font-weight: 600; font-size: 14px; }
        .timeline-location { font-size: 12px; color: #8c8c8c; margin-top: 2px; }
        .timeline-note { font-size: 12px; color: #595959; margin-top: 4px; background: #f5f5f5; border-radius: 4px; padding: 4px 8px; }
        .timeline-time { font-size: 11px; color: #bfbfbf; margin-top: 2px; }
        .timeline-by { font-size: 11px; color: #bfbfbf; }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShipmentDetail implements OnInit {
    shipmentCode: string | null = null;
    shipmentDetails: any = null;
    deliveryInfo: any = null;
    trackingHistory: any[] = [];
    loading = false;
    error = false;

    private logisticService = inject(LogisticService);
    private route = inject(ActivatedRoute);
    private message = inject(NzMessageService);
    private cdr = inject(ChangeDetectorRef);

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            this.shipmentCode = params.get('id');
            if (this.shipmentCode) {
                this.loadAll();
            } else {
                this.error = true;
                this.cdr.detectChanges();
            }
        });
    }

    loadAll(): void {
        if (!this.shipmentCode) return;

        this.error = false;
        this.shipmentDetails = null;
        this.deliveryInfo = null;
        this.trackingHistory = [];
        this.loading = true;

        const shipmentId = Number(this.shipmentCode);
        const shipment$ = Number.isFinite(shipmentId) && shipmentId > 0
            ? this.logisticService.getShipmentById(shipmentId)
            : this.logisticService.getShipmentByCode(this.shipmentCode!);

        shipment$.subscribe({
            next: (data) => {
                if (!data) {
                    this.error = true;
                    this.loading = false;
                    this.cdr.detectChanges();
                    return;
                }
                this.shipmentDetails = data;
                const code = data.shipmentCode;

                forkJoin({
                    delivery: this.logisticService.getFullDeliveryInfo(code).pipe(catchError(() => of(null))),
                    tracking: this.logisticService.getTrackingHistory(code).pipe(catchError(() => of([]))),
                }).pipe(finalize(() => {
                    this.loading = false;
                    this.cdr.detectChanges();
                })).subscribe({
                    next: ({ delivery, tracking }) => {
                        this.deliveryInfo = delivery;
                        this.trackingHistory = Array.isArray(tracking) ? tracking : [];
                    }
                });
            },
            error: (err) => {
                this.error = true;
                this.loading = false;
                this.message.error(err.error?.message || err.message || 'Lỗi khi tải thông tin vận đơn!');
                this.cdr.detectChanges();
            }
        });
    }

    getStatusColor(status: string): string {
        if (!status) return 'default';
        switch (status) {
            case 'DELIVERED': return 'green';
            case 'IN_TRANSIT': return 'blue';
            case 'PICKED_UP': return 'cyan';
            case 'ASSIGNED': return 'geekblue';
            case 'OUT_FOR_DELIVERY': return 'purple';
            case 'PENDING': return 'orange';
            case 'FAILED': return 'red';
            case 'RETURNED': return 'volcano';
            case 'CANCELLED': return 'red';
            default: return 'default';
        }
    }

    getStatusLabel(status: string): string {
        const map: Record<string, string> = {
            PENDING: 'Chờ xử lý',
            ASSIGNED: 'Đã phân công',
            PICKED_UP: 'Đã lấy hàng',
            IN_TRANSIT: 'Đang vận chuyển',
            OUT_FOR_DELIVERY: 'Đang giao',
            DELIVERED: 'Đã giao',
            FAILED: 'Giao thất bại',
            RETURNED: 'Đã hoàn',
            CANCELLED: 'Đã hủy',
        };
        return map[status] || status;
    }

    getTrackingStatusColor(status: string): string {
        switch (status) {
            case 'DELIVERED': return 'green';
            case 'IN_TRANSIT': return 'blue';
            case 'PICKED_UP': return 'cyan';
            case 'ASSIGNED': return 'geekblue';
            case 'OUT_FOR_DELIVERY': return 'purple';
            case 'PENDING': return 'orange';
            case 'FAILED': return 'red';
            default: return 'gray';
        }
    }
}
