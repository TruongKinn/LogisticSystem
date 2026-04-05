import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from '../shared/services/base-api.service';
import { API_CONFIG } from '../shared/constants/api.constant';
import { AuthService } from './auth.service';

export interface TwoFactorResponse {
    secret: string;
    qrCodeUrl: string;
}

@Injectable({
    providedIn: 'root'
})
export class TwoFactorService extends BaseApiService {

    constructor(private authService: AuthService) {
        super(`${API_CONFIG.GATEWAY_URL}/auth/2fa`);
    }

    private buildUserHeaders(): { headers: Record<string, string> } | undefined {
        const userId = this.authService.getStoredItem('atg_user_id');
        if (!userId) {
            return undefined;
        }

        return {
            headers: {
                userId
            }
        };
    }

    generateSecret(): Observable<TwoFactorResponse> {
        return this.post<TwoFactorResponse>('/generate', {}, this.buildUserHeaders());
    }

    getStatus(): Observable<boolean> {
        return this.get<boolean>('/status', this.buildUserHeaders());
    }

    verifyAndEnable(otp: string): Observable<string> {
        return this.post('/verify', { otp }, { ...this.buildUserHeaders(), responseType: 'text' });
    }

    disable(): Observable<string> {
        return this.post('/disable', {}, { ...this.buildUserHeaders(), responseType: 'text' });
    }
}
