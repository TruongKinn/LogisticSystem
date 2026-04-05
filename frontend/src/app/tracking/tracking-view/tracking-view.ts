import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { LogisticService } from '../../shared/services/logistic.service';

@Component({
    selector: 'app-tracking-view',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        NzTableModule,
        NzButtonModule,
        NzInputModule,
        NzTagModule,
        NzIconModule,
        NzTimelineModule,
        NzCardModule,
        NzBreadCrumbModule
    ],
    templateUrl: './tracking-view.html',
    styleUrl: './tracking-view.css'
})
export class TrackingView implements OnInit, OnDestroy {
    searchCode = '';
    loading = false;
    trackingHistory: any[] = [];
    currentTracking: any = null;
    liveRefreshEnabled = true;
    liveRefreshInterval: any;
    liveRefreshSeconds = 20;

    private logisticService = inject(LogisticService);
    private cdr = inject(ChangeDetectorRef);
    private message = inject(NzMessageService);
    private route = inject(ActivatedRoute);

    ngOnInit(): void {
        this.route.queryParamMap.subscribe(params => {
            const code = params.get('code') || params.get('shipmentCode');
            if (code && code !== this.searchCode) {
                this.searchCode = code;
                this.onSearch();
            }
        });

        this.startAutoRefresh();
    }

    ngOnDestroy(): void {
        this.stopAutoRefresh();
    }

    onSearch(): void {
        if (!this.searchCode || this.searchCode.trim() === '') {
            this.message.warning('Vui lòng nhập mã vận đơn để tra cứu!');
            return;
        }

        this.loading = true;
        const shipmentCode = this.searchCode.trim();

        forkJoin({
            history: this.logisticService.getTrackingHistory(shipmentCode).pipe(catchError(() => of([]))),
            current: this.logisticService.getCurrentTracking(shipmentCode).pipe(catchError(() => of(null)))
        }).subscribe({
            next: ({ history, current }) => {
                this.trackingHistory = history || [];
                this.currentTracking = current;

                if (!this.trackingHistory.length && !this.currentTracking) {
                    this.message.info('Không tìm thấy lịch sử nào cho mã vận đơn này.');
                }
            },
            error: () => {
                this.trackingHistory = [];
                this.currentTracking = null;
                this.message.error('Lỗi khi tra cứu lịch sử vận đơn!');
            }
        }).add(() => {
            this.loading = false;
            this.cdr.detectChanges();
        });
    }

    toggleAutoRefresh(): void {
        this.liveRefreshEnabled = !this.liveRefreshEnabled;
        if (this.liveRefreshEnabled) {
            this.startAutoRefresh();
            this.onSearch();
        } else {
            this.stopAutoRefresh();
        }
    }

    refreshNow(): void {
        this.onSearch();
    }

    startAutoRefresh(): void {
        if (this.liveRefreshEnabled) {
            this.liveRefreshInterval = setInterval(() => {
                if (this.searchCode.trim()) {
                    this.onSearch();
                }
            }, this.liveRefreshSeconds * 1000);
        }
    }

    stopAutoRefresh(): void {
        if (this.liveRefreshInterval) {
            clearInterval(this.liveRefreshInterval);
        }
    }

    getColorForStatus(status: string): string {
        switch ((status || '').toUpperCase()) {
            case 'PICKED_UP': return 'blue';
            case 'IN_TRANSIT': return 'processing';
            case 'DELIVERED': return 'green';
            case 'CANCELLED': return 'red';
            case 'DELAYED': return 'warning';
            default: return 'gray';
        }
    }
}
