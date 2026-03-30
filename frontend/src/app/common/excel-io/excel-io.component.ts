import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzUploadModule, NzUploadFile } from 'ng-zorro-antd/upload';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ExcelIoService } from '../../shared/services/excel-io.service';

@Component({
    selector: 'app-excel-io',
    standalone: true,
    imports: [
        CommonModule,
        NzCardModule,
        NzButtonModule,
        NzIconModule,
        NzUploadModule,
        NzAlertModule,
        NzBreadCrumbModule,
        NzDividerModule,
        NzTableModule,
        NzStatisticModule
    ],
    templateUrl: './excel-io.component.html',
    styles: [`
    .mt-3 { margin-top: 1rem; }
    .mt-4 { margin-top: 1.5rem; }
  `]
})
export class ExcelIoComponent {
    exporting = false;
    importResult: any = null;

    constructor(
        private excelIoService: ExcelIoService,
        private message: NzMessageService
    ) { }

    exportSimulation(): void {
        this.exporting = true;
        this.message.loading('Đang chuẩn bị dữ liệu 1 triệu bản ghi (vui lòng chờ trong giây lát)...', { nzDuration: 0 });

        this.excelIoService.downloadSimulationExport().subscribe({
            next: (blob) => {
                this.exporting = false;
                this.message.remove();
                this.message.success('Đã tải dữ liệu thành công!');

                // Create a link element, append to body, use it to download the blob, then cleanup
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.style.display = 'none';
                link.href = url;
                link.download = 'simulation_1m_records.xlsx';
                document.body.appendChild(link);
                link.click();

                // Use a timeout for cleanup to ensure browser has started the download
                setTimeout(() => {
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                }, 1000);
            },
            error: (err) => {
                this.exporting = false;
                this.message.remove();
                this.message.error('Lỗi khi tải file Excel. Vui lòng kiểm tra quyền truy cập.');
                console.error(err);
            }
        });
    }

    beforeUpload = (file: NzUploadFile): boolean => {
        return true; // Use default behavior
    };

    handleUpload(item: any): void {
        const { file } = item;
        if (item.type === 'success') {
            // Done handled by item.type
        } else if (item.type === 'start') {
            const actualFile = item.file.originFileObj;
            if (actualFile) {
                this.message.loading('Đang xử lý file Excel...');
                this.excelIoService.importExcel(actualFile).subscribe({
                    next: (res) => {
                        this.importResult = res;
                        this.message.success(`Đã nhập thành công ${res.totalRecords} bản ghi!`);
                    },
                    error: (err) => {
                        this.message.error('Lỗi khi nhập file Excel');
                        console.error(err);
                    }
                });
            }
        }
    }
}
