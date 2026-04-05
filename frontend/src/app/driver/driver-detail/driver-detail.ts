import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
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
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';

@Component({
    selector: 'app-driver-detail',
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
        NzSkeletonModule,
        NzDividerModule,
        NzAvatarModule
    ],
    templateUrl: './driver-detail.html',
    styles: [`
        .page-container { padding: 24px; background-color: var(--app-bg); min-height: calc(100vh - 64px); }
        .detail-card { width: 100%; border-radius: 12px; margin-bottom: 24px; box-shadow: var(--card-shadow); }
        .header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .page-title { font-size: 22px; font-weight: 700; margin-bottom: 4px; color: var(--text-main); }
        .title-container { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .subtitle { color: #8c8c8c; font-size: 13px; }

        .summary-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
        .summary-card { background: var(--card-bg, #fff); border-radius: 12px; padding: 18px 20px; box-shadow: var(--card-shadow); display: flex; align-items: center; gap: 14px; }
        .summary-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }
        .summary-label { font-size: 12px; color: #8c8c8c; margin-bottom: 4px; }
        .summary-value { font-size: 18px; font-weight: 700; color: var(--text-main, #262626); }

        .info-section-title { font-size: 15px; font-weight: 600; color: var(--text-main); margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DriverDetail implements OnInit {
    driverId: string | null = null;
    driverDetails: any = null;
    loading = false;
    error = false;

    private logisticService = inject(LogisticService);
    private route = inject(ActivatedRoute);
    private message = inject(NzMessageService);
    private cdr = inject(ChangeDetectorRef);

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            this.driverId = params.get('id');
            if (this.driverId) {
                this.loadAll();
            } else {
                this.error = true;
                this.cdr.detectChanges();
            }
        });
    }

    loadAll(): void {
        if (!this.driverId) return;

        this.error = false;
        this.driverDetails = null;
        this.loading = true;

        const id = Number(this.driverId);
        
        this.logisticService.getDriverById(id)
        .pipe(finalize(() => {
            this.loading = false;
            this.cdr.detectChanges();
        })).subscribe({
            next: (data) => {
                if (!data) {
                    this.error = true;
                } else {
                    this.driverDetails = data;
                }
            },
            error: (err) => {
                this.error = true;
                this.message.error(err.error?.message || err.message || 'Lỗi khi tải thông tin tài xế!');
            }
        });
    }

    getStatusColor(status: string): string {
        switch(status) {
            case 'AVAILABLE': return 'green';
            case 'BUSY': return 'blue';
            case 'OFFLINE': return 'red';
            case 'SUSPENDED': return 'orange';
            default: return 'default';
        }
    }
}
