import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzUploadModule, NzUploadFile } from 'ng-zorro-antd/upload';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzMessageService } from 'ng-zorro-antd/message';
import { FileExtractionService } from '../../shared/services/file-extraction.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
    selector: 'app-file-extraction',
    standalone: true,
    imports: [
        CommonModule,
        NzCardModule,
        NzButtonModule,
        NzIconModule,
        NzUploadModule,
        NzAlertModule,
        NzBreadCrumbModule,
        NzDividerModule
    ],
    templateUrl: './file-extraction.component.html',
    styles: [`
    .mt-3 { margin-top: 1rem; }
    .mt-4 { margin-top: 1.5rem; }
  `]
})
export class FileExtractionComponent {
    extracting = false;
    extractedText: string = '';
    uploadedFileName: string = '';

    constructor(
        private fileExtractionService: FileExtractionService,
        private message: NzMessageService,
        private cdr: ChangeDetectorRef
    ) { }

    beforeUpload = (file: NzUploadFile): boolean => {
        const isSupported = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'application/pdf';
        if (!isSupported) {
            this.message.error('Hệ thống chỉ hỗ trợ tải lên file dạng Hình ảnh (.jpg, .png) hoặc PDF (.pdf)!');
            return false;
        }

        this.extract(file as any);
        return false; // Ngăn chặn nz-upload tự upload qua request
    };

    extract(file: File): void {
        this.extracting = true;
        const msgId = this.message.loading('Đang kích hoạt thuật toán OCR / Đọc Text...', { nzDuration: 0 }).messageId;

        this.fileExtractionService.extractText(file).subscribe({
            next: (res) => {
                this.extracting = false;
                this.message.remove(msgId);

                let rawText = res.text || res.data?.text || '';
                let textStr = typeof rawText === 'string' ? rawText.trim() : '';

                this.extractedText = textStr ? textStr : '(Không tìm thấy văn bản nào / Hình ảnh có thể quá mờ hoặc trống)';
                this.uploadedFileName = res.fileName || res.data?.fileName || file.name;
                this.message.success('Đã trích xuất văn bản thành công!');
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.extracting = false;
                this.message.remove(msgId);
                const errorMsg = err?.error?.error || 'Lỗi không xác định';
                this.message.error('Lỗi khi trích xuất: ' + errorMsg);
                console.error(err);
                this.cdr.detectChanges();
            }
        });
    }
}
