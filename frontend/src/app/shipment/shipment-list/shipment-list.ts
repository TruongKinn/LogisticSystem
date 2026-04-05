import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { LogisticService } from '../../shared/services/logistic.service';

import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

type ShipmentStatus = 'PENDING' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'DELAYED' | 'CANCELLED';

@Component({
    selector: 'app-shipment-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterLink,
        NzTableModule,
        NzButtonModule,
        NzInputModule,
        NzTagModule,
        NzIconModule,
        NzToolTipModule,
        NzBreadCrumbModule,
        NzPaginationModule,
        NzDividerModule,
        NzCardModule,
        NzAlertModule,
        NzModalModule,
        NzFormModule,
        NzSelectModule
    ],
    templateUrl: './shipment-list.html',
    styles: [`
      .header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; gap: 16px; }
      .page-title { font-size: 24px; font-weight: 700; margin-bottom: 8px; color: var(--text-main); }
      .page-subtitle { font-size: 14px; color: var(--text-secondary); margin-bottom: 0; }
      .filter-section { background: var(--surface-bg); padding: 24px; border-radius: 12px; margin-bottom: 24px; box-shadow: var(--card-shadow); border: 1px solid var(--border-color); }
      .table-section { background: var(--surface-bg); padding: 24px; border-radius: 12px; box-shadow: var(--card-shadow); border: 1px solid var(--border-color); }
      .action-buttons { display: flex; align-items: center; gap: 8px; }
      .action-buttons a { color: var(--text-secondary); cursor: pointer; }
      .action-buttons a:hover { color: var(--primary-color); }
      .toolbar-actions { display: flex; gap: 12px; flex-wrap: wrap; }
      .form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
      .form-grid .full { grid-column: 1 / -1; }
      .helper-text { color: #64748b; font-size: 12px; line-height: 1.5; }
      .status-chip { display: inline-flex; align-items: center; gap: 6px; }
      .modal-note { margin-top: 12px; color: #64748b; font-size: 12px; }
      @media (max-width: 768px) {
        .header-actions { flex-direction: column; align-items: flex-start; }
        .form-grid { grid-template-columns: 1fr; }
      }
    `]
})
export class ShipmentList implements OnInit {
    shipments: any[] = [];
    loading = false;
    searchValue = '';

    currentPage = 0;
    pageSize = 10;
    totalElements = 0;

    createModalVisible = false;
    statusModalVisible = false;
    assignModalVisible = false;
    selectedShipment: any = null;

    drivers: any[] = [];
    vehicles: any[] = [];
    isAssignDataLoading = false;

    statuses: ShipmentStatus[] = ['PENDING', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'DELAYED', 'CANCELLED'];

    createForm = inject(FormBuilder).group({
        orderRef: ['', [Validators.required]],
        senderName: ['', [Validators.required]],
        senderPhone: [''],
        senderAddress: [''],
        receiverName: ['', [Validators.required]],
        receiverPhone: ['', [Validators.required]],
        receiverAddress: ['', [Validators.required]],
        weightKg: [null],
        codAmount: [null],
        note: ['']
    });

    statusForm = inject(FormBuilder).group({
        status: ['PENDING', [Validators.required]],
        note: ['']
    });

    assignForm = inject(FormBuilder).group({
        driverId: [null, [Validators.required]],
        vehicleId: [null, [Validators.required]]
    });

    private logisticService = inject(LogisticService);
    private cdr = inject(ChangeDetectorRef);
    private message = inject(NzMessageService);

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
                const rows = (data || []).filter((item: any) => {
                    if (!this.searchValue) return true;
                    const term = this.searchValue.toLowerCase();
                    return [
                        item.shipmentCode,
                        item.senderName,
                        item.receiverName,
                        item.orderRef,
                        item.status
                    ].some((field) => String(field || '').toLowerCase().includes(term));
                });

                if (rows.length) {
                    this.shipments = rows.slice(this.currentPage * this.pageSize, (this.currentPage + 1) * this.pageSize);
                    this.totalElements = rows.length;
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
        this.loadData(0);
    }

    openCreateModal(): void {
        this.createForm.reset({
            orderRef: '',
            senderName: '',
            senderPhone: '',
            senderAddress: '',
            receiverName: '',
            receiverPhone: '',
            receiverAddress: '',
            weightKg: null,
            codAmount: null,
            note: ''
        });
        this.createModalVisible = true;
    }

    submitCreate(): void {
        if (this.createForm.invalid) {
            this.createForm.markAllAsTouched();
            return;
        }

        this.loading = true;
        const payload = {
            ...this.createForm.value,
            weightKg: this.createForm.value.weightKg ? Number(this.createForm.value.weightKg) : null,
            codAmount: this.createForm.value.codAmount ? Number(this.createForm.value.codAmount) : null
        };

        this.logisticService.createShipment(payload)
            .pipe(finalize(() => {
                this.loading = false;
                this.cdr.detectChanges();
            }))
            .subscribe({
                next: () => {
                    this.message.success('Đã tạo vận đơn mới');
                    this.createModalVisible = false;
                    this.loadData(0);
                },
                error: (err) => {
                    this.message.error(err.error?.message || err.message || 'Không thể tạo vận đơn');
                }
            });
    }

    openStatusModal(shipment: any): void {
        this.selectedShipment = shipment;
        this.statusForm.reset({
            status: shipment.status || 'PENDING',
            note: shipment.note || ''
        });
        this.statusModalVisible = true;
    }

    submitStatus(): void {
        if (!this.selectedShipment || this.statusForm.invalid) {
            this.statusForm.markAllAsTouched();
            return;
        }

        this.loading = true;
        this.logisticService.updateShipmentStatus(
            this.selectedShipment.id || this.selectedShipment.shipmentId,
            this.statusForm.value.status as ShipmentStatus,
            this.statusForm.value.note || ''
        )
        .pipe(finalize(() => {
            this.loading = false;
            this.cdr.detectChanges();
        }))
        .subscribe({
            next: () => {
                this.message.success('Đã cập nhật trạng thái');
                this.statusModalVisible = false;
                this.loadData(this.currentPage);
            },
            error: (err) => {
                this.message.error(err.error?.message || err.message || 'Không thể cập nhật trạng thái');
            }
        });
    }

    openAssignModal(shipment: any): void {
        this.selectedShipment = shipment;
        this.assignForm.reset({
            driverId: shipment.driverId || null,
            vehicleId: shipment.vehicleId || null
        });
        
        this.isAssignDataLoading = true;
        forkJoin({
            drivers: this.logisticService.getDrivers(),
            vehicles: this.logisticService.getVehicles()
        }).pipe(finalize(() => {
            this.isAssignDataLoading = false;
            this.cdr.detectChanges();
        })).subscribe({
            next: (data) => {
                this.drivers = data.drivers || [];
                this.vehicles = data.vehicles || [];
            },
            error: () => {
                this.message.error('Không thể tải danh sách tài xế/xe');
            }
        });

        this.assignModalVisible = true;
    }

    submitAssign(): void {
        if (!this.selectedShipment || this.assignForm.invalid) {
            this.assignForm.markAllAsTouched();
            return;
        }

        this.loading = true;
        this.logisticService.assignDelivery(
            this.selectedShipment.shipmentCode,
            Number(this.assignForm.value.driverId),
            Number(this.assignForm.value.vehicleId)
        )
        .pipe(finalize(() => {
            this.loading = false;
            this.cdr.detectChanges();
        }))
        .subscribe({
            next: () => {
                this.message.success('Đã gán tài xế và xe');
                this.assignModalVisible = false;
                this.loadData(this.currentPage);
            },
            error: (err) => {
                this.message.error(err.error?.message || err.message || 'Không thể gán tài xế/xe');
            }
        });
    }

    unassignShipment(shipment: any): void {
        const shipmentId = shipment.id || shipment.shipmentId;
        if (!shipmentId) {
            this.message.warning('Không xác định được vận đơn');
            return;
        }

        this.loading = true;
        this.logisticService.unassignShipment(shipmentId)
            .pipe(finalize(() => {
                this.loading = false;
                this.cdr.detectChanges();
            }))
            .subscribe({
                next: () => {
                    this.message.info('Đã gỡ phân công vận đơn');
                    this.loadData(this.currentPage);
                },
                error: (err) => {
                    this.message.error(err.error?.message || err.message || 'Không thể gỡ phân công');
                }
            });
    }

    getStatusColor(status: string): string {
        switch(status) {
            case 'DELIVERED': return 'green';
            case 'IN_TRANSIT': return 'blue';
            case 'PICKED_UP': return 'cyan';
            case 'PENDING': return 'orange';
            case 'DELAYED': return 'gold';
            case 'CANCELLED': return 'red';
            default: return 'default';
        }
    }

    getStatusIcon(status: string): string {
        switch(status) {
            case 'DELIVERED': return 'check-circle';
            case 'IN_TRANSIT': return 'sync';
            case 'PICKED_UP': return 'arrow-up';
            case 'PENDING': return 'clock-circle';
            case 'DELAYED': return 'warning';
            case 'CANCELLED': return 'close-circle';
            default: return 'info-circle';
        }
    }
}
