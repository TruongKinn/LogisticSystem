export interface Notification {
    id: number;
    message: string;
    recipientId: string;
    type: string;       // ORDER_CREATED, PAYMENT_SUCCESS, PAYMENT_FAILED, GENERAL
    title: string;
    referenceId: string;
    provider: string;   // WEBSOCKET, SNS, OneSignal
    status: string;     // SUCCESS, FAILED
    createdAt: string;
    isRead: boolean;
}

export interface NotificationPageResponse {
    page: number;
    size: number;
    total: number;
    items: Notification[];
}

/** DTO nhận từ WebSocket real-time */
export interface NotificationMessage {
    id?: number;
    recipientId?: string;
    type: string;
    title: string;
    message: string;
    referenceId?: string;
    isRead?: boolean;
}
