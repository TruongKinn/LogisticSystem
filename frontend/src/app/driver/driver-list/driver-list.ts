import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LogisticService } from '../../shared/services/logistic.service';

import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';

import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzMessageService } from 'ng-zorro-antd/message';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-driver-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterLink,
        NzTableModule, NzButtonModule, NzInputModule, NzTagModule, NzIconModule, NzToolTipModule, NzBreadCrumbModule, NzPaginationModule, NzDividerModule,
        NzModalModule, NzFormModule
    ],
    templateUrl: './driver-list.html',
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
export class DriverList implements OnInit {
    allDrivers: any[] = [];
    drivers: any[] = [];
    loading = false;
    searchValue = '';

    currentPage = 0;
    pageSize = 10;
    totalElements = 0;

    createModalVisible = false;
    createForm = inject(FormBuilder).group({
        employeeCode: ['', [Validators.required]],
        fullName: ['', [Validators.required]],
        phone: ['', [Validators.required]],
        email: [''],
        identityCard: [''],
        licenseClass: [''],
        zone: [''],
        address: ['']
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
        this.logisticService.getDrivers()
        .pipe(finalize(() => {
            this.loading = false;
            this.cdr.detectChanges();
        }))
        .subscribe({
            next: (data) => {
                if (data && data.length) {
                    this.allDrivers = data;
                    this.drivers = data.slice(this.currentPage * this.pageSize, (this.currentPage + 1) * this.pageSize);
                    this.totalElements = data.length;
                } else {
                    this.allDrivers = [];
                    this.drivers = [];
                    this.totalElements = 0;
                }
            },
            error: () => {
                this.allDrivers = [];
                this.drivers = [];
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

    getStatusColor(status: string): string {
        switch(status) {
            case 'AVAILABLE': return 'green';
            case 'BUSY': return 'blue';
            case 'OFFLINE': return 'red';
            case 'SUSPENDED': return 'warning';
            default: return 'default';
        }
    }

    getStatusIcon(status: string): string {
        switch(status) {
            case 'AVAILABLE': return 'check-circle';
            case 'BUSY': return 'car';
            case 'OFFLINE': return 'minus-circle';
            case 'SUSPENDED': return 'stop';
            default: return 'info-circle';
        }
    }

    openCreateModal(): void {
        this.createForm.reset();
        this.createModalVisible = true;
    }

    submitCreate(): void {
        if (this.createForm.valid) {
            this.loading = true;
            this.logisticService.createDriver(this.createForm.value)
                .pipe(finalize(() => {
                    this.loading = false;
                    this.cdr.detectChanges();
                }))
                .subscribe({
                    next: () => {
                        this.message.success('Tạo tài xế thành công');
                        this.createModalVisible = false;
                        this.loadData(0);
                    },
                    error: (err) => {
                        this.message.error(err.error?.message || 'Lỗi khi tạo tài xế');
                    }
                });
        } else {
            Object.values(this.createForm.controls).forEach(control => {
                if (control.invalid) {
                    control.markAsDirty();
                    control.updateValueAndValidity({ onlySelf: true });
                }
            });
        }
    }

    cloneDriver(driver: any): void {
        this.createForm.patchValue({
            employeeCode: (driver.employeeCode || '') + '_COPY',
            fullName: driver.fullName,
            phone: driver.phone,
            email: driver.email,
            identityCard: driver.identityCard,
            licenseClass: driver.licenseClass,
            zone: driver.zone,
            address: driver.address
        });
        this.createModalVisible = true;
    }

    onFileChange(event: any): void {
        const target: DataTransfer = <DataTransfer>(event.target);
        if (target.files.length !== 1) {
            this.message.error('Vui lòng chọn 1 file duy nhất');
            return;
        }
        
        const file = target.files[0];
        this.loading = true;
        
        this.logisticService.importDrivers(file)
            .pipe(finalize(() => {
                this.loading = false;
                this.cdr.detectChanges();
                event.target.value = null; // Clear input
            }))
            .subscribe({
                next: (res) => {
                    this.message.success(res.message || `Đã import thành công ${res.count || 0} tài xế mới.`);
                    this.loadData(0);
                },
                error: (err) => {
                    this.message.error(err.error?.message || 'Có lỗi xảy ra khi import file từ Server');
                }
            });
    }

    downloadTemplate(): void {
        this.loading = true;
        this.logisticService.downloadDriverImportTemplate()
            .pipe(finalize(() => {
                this.loading = false;
                this.cdr.detectChanges();
            }))
            .subscribe({
                next: (blob) => {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'driver_import_template.xlsx';
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    a.remove();
                    this.message.success('Tải template thành công');
                },
                error: () => {
                    this.message.error('Có lỗi xảy ra khi tải template');
                }
            });
    }
}
