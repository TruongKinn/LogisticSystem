import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { Observable } from 'rxjs';
import { NotificationPageResponse } from '../models/notification.model';
import { API_CONFIG } from '../constants/api.constant';

@Injectable({
    providedIn: 'root'
})
export class NotificationService extends BaseApiService {

    constructor() {
        super(`${API_CONFIG.GATEWAY_URL}/notification/api/v1/notifications`);
    }

    getHistory(page: number, size: number): Observable<NotificationPageResponse> {
        return this.get<NotificationPageResponse>('', { page, size });
    }

    sendNotification(message: string, playerId: string): Observable<string> {
        return this.postText('/send', null, { params: { message, playerId } });
    }

    sendWsNotification(payload: any): Observable<string> {
        return this.postText('/send-ws', payload);
    }

    getUnreadCount(): Observable<number> {
        return this.get<number>('/unread-count');
    }

    markAllAsRead(): Observable<any> {
        return this.put<any>('/mark-all-read', {});
    }

    markAsRead(id: number): Observable<any> {
        return this.put<any>(`/${id}/read`, {});
    }
}
