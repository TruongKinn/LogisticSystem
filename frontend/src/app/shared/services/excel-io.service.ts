import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../constants/api.constant';

@Injectable({
    providedIn: 'root'
})
export class ExcelIoService extends BaseApiService {

    constructor() {
        super(`${API_CONFIG.GATEWAY_URL}/common/api/v1/excel`);
    }

    /**
     * Trigger simulation export (1M records) securely using HttpClient.
     * This ensures Authorization header is sent.
     */
    downloadSimulationExport(): Observable<Blob> {
        return this.downloadBlob('/export-simulation');
    }

    /**
     * Import Excel file.
     */
    importExcel(file: File): Observable<any> {
        const formData = new FormData();
        formData.append('file', file);
        return this.post<any>('/import', formData);
    }
}
