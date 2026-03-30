import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LogisticService } from '../../shared/services/logistic.service';

import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-shipment-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterLink,
        NzTableModule, NzButtonModule, NzInputModule, NzTagModule, NzIconModule, NzToolTipModule, NzBreadCrumbModule, NzPaginationModule, NzDividerModule
    ],
    templateUrl: './shipment-list.html',
    styles: [`
      .header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
      .page-title { font-size: 24px; font-weight: 700; margin-bottom: 8px; color: var(--text-main); }
      .page-subtitle { font-size: 14px; color: var(--text-secondary); margin-bottom: 0; }
      .filter-section { background: var(--surface-bg); padding: 24px; border-radius: 12px; margin-bottom: 24px; box-shadow: var(--card-shadow); border: 1px solid var(--border-color); }
      .table-section { background: var(--surface-bg); padding: 24px; border-radius: 12px; box-shadow: var(--card-shadow); border: 1px solid var(--border-color); }
      .action-buttons { display: flex; align-items: center; gap: 8px; }
      .action-buttons a { color: var(--text-secondary); cursor: pointer; }
      .action-buttons a:hover { color: var(--primary-color); }
    `]
})
export class ShipmentList implements OnInit {
    shipments: any[] = [];
    loading = false;
    searchValue = '';

    currentPage = 0;
    pageSize = 10;
    totalElements = 0;

    private logisticService = inject(LogisticService);
    private cdr = inject(ChangeDetectorRef);

    ngOnInit(): void {
        this.loadData();
    }

    loadData(page: number = 0): void {
        this.loading = true;
        this.currentPage = page;
        this.logisticService.getShipments()
        .pipe(finalize(() => {
            this.loading = false;
            this.cdr.detectChanges();
        }))
        .subscribe({
            next: (data) => {
                if (data && data.length) {
                    this.shipments = data.slice(this.currentPage * this.pageSize, (this.currentPage + 1) * this.pageSize);
                    this.totalElements = data.length;
                } else {
                    this.shipments = [];
                    this.totalElements = 0;
                }
            },
            error: () => {
                this.shipments = [];
                this.totalElements = 0;
            }
        });
    }

    onPageChange(page: number): void {
        this.loadData(page - 1);
    }

    onPageSizeChange(size: number): void {
        this.pageSize = size;
        this.loadData(0);
    }

    onSearch(): void {
        this.loadData(0); // For now, mock searching by reloading page 0
    }

    getStatusColor(status: string): string {
        switch(status) {
            case 'DELIVERED': return 'green';
            case 'IN_TRANSIT': return 'blue';
            case 'PENDING': return 'orange';
            case 'CANCELLED': return 'red';
            default: return 'default';
        }
    }

    getStatusIcon(status: string): string {
        switch(status) {
            case 'DELIVERED': return 'check-circle';
            case 'IN_TRANSIT': return 'sync';
            case 'PENDING': return 'clock-circle';
            case 'CANCELLED': return 'close-circle';
            default: return 'info-circle';
        }
    }
}
