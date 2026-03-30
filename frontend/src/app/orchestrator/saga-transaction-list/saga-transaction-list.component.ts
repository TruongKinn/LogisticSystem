import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import { NzModalModule } from 'ng-zorro-antd/modal';
import { OrchestratorService } from '../../shared/services/orchestrator.service';
import { SagaTransaction } from '../../shared/models/saga-transaction.model';
import { SagaTransactionDetailComponent } from '../saga-transaction-detail/saga-transaction-detail.component';

@Component({
    selector: 'app-saga-transaction-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
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
        SagaTransactionDetailComponent
    ],
    templateUrl: './saga-transaction-list.component.html',
    styles: [`
        :host {
            display: block;
        }
    `]
})
export class SagaTransactionListComponent implements OnInit {
    transactions: SagaTransaction[] = [];
    loading = false;
    pageIndex = 1;
    pageSize = 10;
    Math = Math;

    selectedTransaction: SagaTransaction | null = null;
    isDetailVisible = false;

    constructor(
        private orchestratorService: OrchestratorService,
        private msg: NzMessageService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        this.loading = true;
        this.orchestratorService.getTransactions().subscribe({
            next: (data) => {
                this.transactions = data;
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.loading = false;
                this.msg.error('Không thể tải danh sách giao dịch Saga');
                this.cdr.detectChanges();
            }
        });
    }

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

    viewDetail(transaction: SagaTransaction): void {
        this.selectedTransaction = transaction;
        this.isDetailVisible = true;
    }

    handleCancelDetail(): void {
        this.isDetailVisible = false;
        this.selectedTransaction = null;
    }
}
