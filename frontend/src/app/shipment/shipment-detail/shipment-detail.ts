import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { LogisticService } from '../../shared/services/logistic.service';

import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTabsModule } from 'ng-zorro-antd/tabs';

@Component({
    selector: 'app-shipment-detail',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        NzCardModule,
        NzDescriptionsModule,
        NzButtonModule,
        NzTagModule,
        NzIconModule,
        NzBreadCrumbModule,
        NzTabsModule
    ],
    templateUrl: './shipment-detail.html',
    styles: [`
        .page-container { padding: 24px; background-color: var(--app-bg); min-height: calc(100vh - 64px); }
        .detail-card { width: 100%; border-radius: 12px; margin-bottom: 24px; box-shadow: var(--card-shadow); }
        .header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .page-title { font-size: 24px; font-weight: 700; margin-bottom: 8px; color: var(--text-main); }
        .title-container { display: flex; align-items: center; gap: 12px; }
    `]
})
export class ShipmentDetail implements OnInit {
    shipmentCode: string | null = null;
    shipmentDetails: any = null;
    loading = false;
    error = false;

    private logisticService = inject(LogisticService);
    private route = inject(ActivatedRoute);
    private message = inject(NzMessageService);

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            this.shipmentCode = params.get('id');
            if (this.shipmentCode) {
                this.loadShipmentDetails();
            } else {
                this.error = true;
            }
        });
    }

    loadShipmentDetails(): void {
        if (!this.shipmentCode) return;

        this.error = false;
        this.shipmentDetails = null;
        this.loading = true;

        const shipmentId = Number(this.shipmentCode);
        const request$ = Number.isFinite(shipmentId) && shipmentId > 0
            ? this.logisticService.getShipmentById(shipmentId)
            : this.logisticService.getShipmentByCode(this.shipmentCode);

        request$
            .pipe(finalize(() => {
                this.loading = false;
            }))
            .subscribe({
                next: (data) => {
                    if (data) {
                        this.shipmentDetails = data;
                    } else {
                        this.error = true;
                    }
                },
                error: (err) => {
                    this.error = true;
                    this.message.error(err.error?.message || err.message || 'Lỗi khi tải thông tin chi tiết vận đơn!');
                }
            });
    }

    getStatusColor(status: string): string {
        if (!status) return 'default';
        switch (status) {
            case 'DELIVERED': return 'green';
            case 'IN_TRANSIT': return 'blue';
            case 'PENDING': return 'orange';
            case 'CANCELLED': return 'red';
            default: return 'default';
        }
    }
}
