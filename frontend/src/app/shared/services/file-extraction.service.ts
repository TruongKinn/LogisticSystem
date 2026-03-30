import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../constants/api.constant';

@Injectable({
    providedIn: 'root'
})
export class FileExtractionService extends BaseApiService {

    constructor() {
        super(`${API_CONFIG.GATEWAY_URL}/common/api/v1/common/file-extraction`);
    }

    /**
     * Tự động trích xuất chữ từ ảnh hoặc pdf
     */
    extractText(file: File, language: string = 'vie+eng'): Observable<any> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('language', language);
        return this.post<any>('/extract-text', formData);
    }
}
