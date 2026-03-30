import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from '../shared/services/base-api.service';
import { API_CONFIG } from '../shared/constants/api.constant';

export interface TwoFactorResponse {
    secret: string;
    qrCodeUrl: string;
}

@Injectable({
    providedIn: 'root'
})
export class TwoFactorService extends BaseApiService {

    constructor() {
        super(`${API_CONFIG.GATEWAY_URL}/auth/2fa`);
    }

    generateSecret(): Observable<TwoFactorResponse> {
        return this.post<TwoFactorResponse>('/generate', {});
    }

    getStatus(): Observable<boolean> {
        return this.get<boolean>('/status');
    }

    verifyAndEnable(otp: string): Observable<string> {
        return this.post('/verify', { otp }, { responseType: 'text' });
    }

    disable(): Observable<string> {
        return this.post('/disable', {}, { responseType: 'text' });
    }
}
