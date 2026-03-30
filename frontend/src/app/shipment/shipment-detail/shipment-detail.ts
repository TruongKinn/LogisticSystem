import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LogisticService } from '../../shared/services/logistic.service';

import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-shipment-detail',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        NzCardModule, NzDescriptionsModule, NzButtonModule, NzTagModule, NzIconModule, NzBreadCrumbModule, NzTabsModule
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
    private cdr = inject(ChangeDetectorRef);
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
        this.loading = true;
        
        // Since the route might pass ID or Code, we use getShipmentByCode
        this.logisticService.getShipmentByCode(this.shipmentCode)
        .pipe(finalize(() => {
            this.loading = false;
            this.cdr.detectChanges();
        }))
        .subscribe({
            next: (data) => {
                if(data) {
                    this.shipmentDetails = data;
                } else {
                    this.error = true;
                }
            },
            error: () => {
                this.error = true;
                this.message.error('Lỗi khi tải thông tin chi tiết vận đơn!');
            }
        });
    }

    getStatusColor(status: string): string {
        if (!status) return 'default';
        switch(status) {
            case 'DELIVERED': return 'green';
            case 'IN_TRANSIT': return 'blue';
            case 'PENDING': return 'orange';
            case 'CANCELLED': return 'red';
            default: return 'default';
        }
    }
}
