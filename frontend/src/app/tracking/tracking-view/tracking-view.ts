import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LogisticService } from '../../shared/services/logistic.service';

import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzMessageService } from 'ng-zorro-antd/message';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-tracking-view',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        NzTableModule, NzButtonModule, NzInputModule, NzTagModule, NzIconModule, NzTimelineModule, NzCardModule, NzBreadCrumbModule
    ],
    templateUrl: './tracking-view.html',
    styles: [`
      .header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
      .page-title { font-size: 24px; font-weight: 700; margin-bottom: 8px; color: var(--text-main); }
      .page-subtitle { font-size: 14px; color: var(--text-secondary); margin-bottom: 0; }
      .filter-section { background: var(--surface-bg); padding: 24px; border-radius: 12px; margin-bottom: 24px; box-shadow: var(--card-shadow); border: 1px solid var(--border-color); }
      .tracking-section { background: var(--surface-bg); padding: 24px; border-radius: 12px; box-shadow: var(--card-shadow); border: 1px solid var(--border-color); }
      .tracking-time { font-size: 12px; color: #8c8c8c; margin-top: 4px; }
    `]
})
export class TrackingView {
    searchCode = '';
    loading = false;
    trackingHistory: any[] = [];
    trackingDetails: any = null;

    private logisticService = inject(LogisticService);
    private cdr = inject(ChangeDetectorRef);
    private message = inject(NzMessageService);

    onSearch(): void {
        if (!this.searchCode || this.searchCode.trim() === '') {
            this.message.warning('Vui lòng nhập mã vận đơn để tra cứu!');
            return;
        }

        this.loading = true;
        this.logisticService.getTrackingHistory(this.searchCode.trim())
        .pipe(finalize(() => {
            this.loading = false;
            this.cdr.detectChanges();
        }))
        .subscribe({
            next: (data) => {
                if (data && data.length > 0) {
                    this.trackingHistory = data;
                } else {
                    this.trackingHistory = [];
                    this.message.info('Không tìm thấy lịch sử nào cho mã vận tải này.');
                }
            },
            error: () => {
                this.trackingHistory = [];
                this.message.error('Lỗi khi tra cứu lịch sử vận đơn!');
            }
        });
    }

    getColorForStatus(status: string): string {
        switch(status) {
            case 'PICKED_UP': return 'blue';
            case 'IN_TRANSIT': return 'processing';
            case 'DELIVERED': return 'green';
            case 'CANCELLED': return 'red';
            case 'DELAYED': return 'warning';
            default: return 'gray';
        }
    }
}
