import { Component, OnInit, ChangeDetectorRef, ViewEncapsulation, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../shared/services/user.service';
import { UserResponseDTO } from '../../shared/models/user.model';
import { PageResponse } from '../../shared/models/page-response.model';

import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { UserDetailComponent } from '../user-detail/user-detail.component';
import { Gender } from '../../shared/models/user.model';

@Component({
    selector: 'app-user-list',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        NzTableModule,
        NzButtonModule,
        NzIconModule,
        NzPopconfirmModule,
        NzInputModule,
        FormsModule,
        NzDividerModule,
        NzDividerModule,
        NzBreadCrumbModule,
        NzModalModule,
        NzPaginationModule,
        NzDropDownModule,
        NzCheckboxModule,
        NzTagModule,
        NzToolTipModule
    ],
    templateUrl: './user-list.component.html',
    styleUrls: ['./user-list.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class UserListComponent implements OnInit {
    @ViewChild('columnDropdown') columnDropdown: any;
    Gender = Gender;
    users: UserResponseDTO[] = [];
    loading = false;
    total = 0;
    pageIndex = 0;
    pageSize = 10;
    sortKey: string | null = null;
    sortValue: string | null = null;
    searchValue = '';
    isColumnDropdownVisible = false;

    listOfColumns = [
        { name: 'Username', key: 'username', visible: true, showTooltip: false },
        { name: 'Email', key: 'email', visible: true, showTooltip: false },
        { name: 'Họ', key: 'firstName', visible: true, showTooltip: false },
        { name: 'Tên', key: 'lastName', visible: true, showTooltip: false },
        { name: 'Số điện thoại', key: 'phone', visible: true, showTooltip: false },
        { name: 'Giới tính', key: 'gender', visible: true, showTooltip: false },
        { name: 'Ngày sinh', key: 'dateOfBirth', visible: true, showTooltip: false },
        { name: 'Hành động', key: 'action', visible: true, showTooltip: false }
    ];

    columnSearchValue = '';
    activeConfigTab = 'custom'; // 'custom' | 'default'

    readonly COLUMN_SETTING_KEY = 'user_list_columns';

    get filteredColumns() {
        if (!this.columnSearchValue) return this.listOfColumns;
        return this.listOfColumns.filter(c =>
            c.name.toLowerCase().includes(this.columnSearchValue.toLowerCase())
        );
    }

    constructor(
        private userService: UserService,
        private msg: NzMessageService,
        private cdr: ChangeDetectorRef,
        private modalService: NzModalService
    ) { }

    ngOnInit(): void {
        this.loadSettings();
        this.loadData();
    }

    loadSettings(): void {
        this.userService.getSetting(this.COLUMN_SETTING_KEY).subscribe({
            next: (res) => {
                const value = res?.value;
                if (value && value !== 'null' && value !== '') {
                    try {
                        let settings = JSON.parse(value);
                        if (typeof settings === 'string') {
                            settings = JSON.parse(settings);
                        }

                        if (Array.isArray(settings)) {
                            this.listOfColumns.forEach(col => {
                                col.visible = settings.includes(col.key);
                            });
                        } else if (settings && typeof settings === 'object') {
                            this.listOfColumns.forEach(col => {
                                col.visible = settings.visible?.includes(col.key) ?? true;
                                col.showTooltip = settings.tooltips?.includes(col.key) ?? false;
                            });
                        }
                        this.listOfColumns = [...this.listOfColumns];
                        this.cdr.detectChanges();
                    } catch (e) {
                        console.error('Failed to parse column settings', e);
                    }
                }
            }
        });
    }

    saveSettings(): void {
        const visibleKeys = this.listOfColumns.filter(c => c.visible).map(c => c.key);
        const tooltipKeys = this.listOfColumns.filter(c => c.showTooltip).map(c => c.key);

        const value = JSON.stringify({
            visible: visibleKeys,
            tooltips: tooltipKeys
        });

        this.userService.saveSetting(this.COLUMN_SETTING_KEY, value).subscribe({
            next: () => {
                this.msg.success('Đã lưu cấu hình cột');
                this.isColumnDropdownVisible = false;
                this.cdr.detectChanges();
            },
            error: () => this.msg.error('Không thể lưu cấu hình')
        });
    }

    applyDefaultSetup(): void {
        this.listOfColumns.forEach(c => {
            c.visible = true;
            c.showTooltip = false;
        });
        this.saveSettings();
        this.activeConfigTab = 'custom';
    }

    closeDropdown(): void {
        this.isColumnDropdownVisible = false;
    }

    resetColumns(): void {
        this.applyDefaultSetup();
    }

    isTooltipEnabled(key: string): boolean {
        const col = this.listOfColumns.find(c => c.key === key);
        return col ? !!col.showTooltip : false;
    }

    loadData(): void {
        this.loading = true;

        let springSort = '';
        if (this.sortKey && this.sortValue) {
            const direction = this.sortValue === 'ascend' ? 'asc' : 'desc';
            springSort = `${this.sortKey}:${direction}`;
        }

        const searchParams = this.searchValue ? [this.searchValue] : undefined;

        this.userService.getUsers(this.pageIndex, this.pageSize, springSort || undefined, searchParams).subscribe({
            next: (data: PageResponse<UserResponseDTO>) => {
                this.loading = false;
                this.users = data.items;
                this.total = data.total;
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.loading = false;
                this.msg.error('Failed to load users');
                this.cdr.detectChanges();
            }
        });
    }

    onQueryParamsChange(params: any): void {
        const { sort } = params;
        const currentSort = sort.find((item: any) => item.value !== null);
        const newSortKey = (currentSort && currentSort.key) || null;
        const newSortValue = (currentSort && currentSort.value) || null;

        if (this.sortKey !== newSortKey || this.sortValue !== newSortValue) {
            this.sortKey = newSortKey;
            this.sortValue = newSortValue;
            this.pageIndex = 0;
            this.loadData();
        }
    }

    onSearch(): void {
        this.pageIndex = 0;
        this.loadData();
    }

    onPageIndexChange(index: number): void {
        this.pageIndex = index - 1;
        this.loadData();
    }

    onPageSizeChange(size: number): void {
        this.pageSize = size;
        this.pageIndex = 0;
        this.loadData();
    }

    isColumnVisible(key: string): boolean {
        const col = this.listOfColumns.find(c => c.key === key);
        return col ? col.visible : true;
    }

    openModal(userId?: number): void {
        const modal = this.modalService.create({
            nzTitle: undefined,
            nzContent: UserDetailComponent,
            nzData: {
                userId: userId || null,
                isEditMode: !!userId
            },
            nzFooter: null,
            nzWidth: 960,
            nzStyle: { top: '20px' }
        });

        const instance = modal.componentInstance as UserDetailComponent;
        instance.userId = userId || null;
        instance.isEditMode = !!userId;

        modal.afterClose.subscribe(result => {
            if (result) {
                this.loadData();
            }
        });
    }

    deleteUser(userId: number): void {
        this.modalService.confirm({
            nzTitle: 'Xác nhận xoá',
            nzContent: 'Bạn có chắc chắn muốn xoá người dùng này không?',
            nzOkText: 'Xoá',
            nzOkType: 'primary',
            nzOkDanger: true,
            nzOnOk: () => {
                this.userService.deleteUser(userId).subscribe({
                    next: () => {
                        this.msg.success('User deleted successfully');
                        this.loadData();
                    },
                    error: () => this.msg.error('Failed to delete user')
                });
            },
            nzCancelText: 'Huỷ'
        });
    }
}
