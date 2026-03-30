import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../constants/api.constant';

export interface MailQueueMessage {
    mailType: 'SIMPLE' | 'TEMPLATE' | 'DYNAMIC_TEMPLATE';
    toEmail: string;
    subject: string;
    body?: string;
    templateName?: string;
    propertiesJson?: string;
    templateId?: string;
    dynamicDataJson?: string;
    retryCount?: number;
    lastError?: string;
    createdAt?: string;
}

export interface QueueInfo {
    name: string;
    messageCount: number;
    consumerCount: number;
    error?: string;
}

export interface QueueStatus {
    sendQueue: QueueInfo | null;
    retryQueue: QueueInfo | null;
    deadQueue: QueueInfo | null;
}

@Injectable({
    providedIn: 'root'
})
export class MailService extends BaseApiService {

    constructor() {
        super(`${API_CONFIG.GATEWAY_URL}/mail`);
    }

    // ──────────────────────────────────────────────
    // Direct send (API cũ giữ lại)
    // ──────────────────────────────────────────────
    sendEmail(toEmail: string, subject: string, body: string): Observable<string> {
        return this.get<string>('/send', { toEmail, subject, body });
    }

    simpleSend(): Observable<string> {
        return this.get<string>('/simple-send');
    }

    sendTemplate(toEmail: string, subject: string, templateName: string, properties: any): Observable<string> {
        const payload = properties;
        return this.postText(`/send-template?toEmail=${encodeURIComponent(toEmail)}&subject=${encodeURIComponent(subject)}&templateName=${encodeURIComponent(templateName)}`, payload);
    }

    sendDynamicTemplate(toEmail: string, subject: string, templateId: string, dynamicData: any): Observable<string> {
        const payload = dynamicData;
        return this.postText(`/send-dynamic-template?toEmail=${encodeURIComponent(toEmail)}&subject=${encodeURIComponent(subject)}&templateId=${encodeURIComponent(templateId)}`, payload);
    }

    // ──────────────────────────────────────────────
    // RabbitMQ Queue APIs (mới)
    // ──────────────────────────────────────────────
    publishSimpleMail(toEmail: string, subject: string, body: string): Observable<any> {
        return this.post<any>('/queue/publish/simple', { toEmail, subject, body });
    }

    publishTemplateMail(toEmail: string, subject: string, templateName: string, propertiesJson: string): Observable<any> {
        return this.post<any>('/queue/publish/template', { toEmail, subject, templateName, propertiesJson });
    }

    publishDynamicMail(toEmail: string, subject: string, templateId: string, dynamicDataJson: string): Observable<any> {
        return this.post<any>('/queue/publish/dynamic', { toEmail, subject, templateId, dynamicDataJson });
    }

    getQueueStatus(): Observable<QueueStatus> {
        return this.get<QueueStatus>('/queue/status');
    }

    requeueDeadMessage(): Observable<any> {
        return this.post<any>('/queue/requeue-dead', {});
    }
}
