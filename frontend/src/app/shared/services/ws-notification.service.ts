import { Injectable, OnDestroy, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { NotificationMessage, Notification } from '../models/notification.model';
import { API_CONFIG } from '../constants/api.constant';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class WebSocketNotificationService implements OnDestroy {

    private stompClient!: Client;
    private connected = false;

    constructor(
        private notificationService: NotificationService,
        private ngZone: NgZone
    ) { }

    /** Stream các notification nhận được real-time */
    private notificationsSubject = new BehaviorSubject<NotificationMessage[]>([]);
    public notifications$: Observable<NotificationMessage[]> = this.notificationsSubject.asObservable();

    /** Badge count — số notification chưa đọc */
    private unreadCountSubject = new BehaviorSubject<number>(0);
    public unreadCount$: Observable<number> = this.unreadCountSubject.asObservable();

    /** URL WebSocket endpoint của notification-service (qua API Gateway) */
    private readonly WS_URL = API_CONFIG.NOTIFICATION_WS_URL;

    connect(): void {
        if (this.connected) return;

        this.stompClient = new Client({
            webSocketFactory: () => new SockJS(this.WS_URL) as WebSocket,
            reconnectDelay: 5000,
            debug: (str) => {
                console.log('[STOMP DEBUG]:', str);
            },
            onConnect: () => {
                this.connected = true;
                console.log('[WS] Connected to notification-service');

                // Subscribe tới broadcast (tất cả users)
                this.stompClient.subscribe('/topic/notifications', (msg: IMessage) => {
                    this.handleMessage(msg.body);
                });

                // Tự động lấy userId và subscribe nhận tin riêng thay vì chờ module khác gọi
                const userId = localStorage.getItem('atg_user_id');
                if (userId) {
                    this.stompClient.subscribe(`/topic/notifications/${userId}`, (msg: IMessage) => {
                        this.handleMessage(msg.body);
                    });
                }

                // Load lịch sử thông báo khi mới kết nối để dropdown không bị rỗng
                this.loadHistory();
            },
            onStompError: (frame) => {
                console.error('[WS] STOMP error:', frame);
            },
            onDisconnect: () => {
                this.connected = false;
                console.log('[WS] Disconnected from notification-service');
            }
        });

        this.stompClient.activate();
    }

    /** Subscribe thêm notification riêng của user (cần userId) */
    subscribeUser(userId: string): void {
        if (!this.connected || !this.stompClient?.connected) return;
        this.stompClient.subscribe(`/topic/notifications/${userId}`, (msg: IMessage) => {
            this.handleMessage(msg.body);
        });
    }

    private loadHistory(): void {
        this.notificationService.getHistory(1, 10).subscribe({
            next: (res) => {
                // Đổ lịch sử vào BehaviorSubject
                const historyMsgs: NotificationMessage[] = res.items.map((n: Notification) => ({
                    id: n.id,
                    title: n.title,
                    type: n.type,
                    message: n.message,
                    referenceId: n.referenceId,
                    isRead: n.isRead
                }));
                const updated = historyMsgs.slice(0, 50);
                this.notificationsSubject.next(updated);
            },
            error: (err) => console.error('[WS] Failed to load notification history', err)
        });

        this.notificationService.getUnreadCount().subscribe({
            next: (count) => this.unreadCountSubject.next(count),
            error: (err) => console.error('[WS] Failed to load unread count', err)
        });
    }

    private handleMessage(body: string): void {
        console.log('[WS] ---> STOMP Received raw message:', body);
        try {
            const msg: NotificationMessage = JSON.parse(body);
            msg.isRead = false; // Mặc định thông báo real-time mới nhận sẽ là chưa đọc

            this.ngZone.run(() => {
                const current = this.notificationsSubject.getValue();
                // Giới hạn 50 notification trong bộ nhớ
                const updated = [msg, ...current].slice(0, 50);
                this.notificationsSubject.next(updated);
                this.unreadCountSubject.next(this.unreadCountSubject.getValue() + 1);
                console.log('[WS] ---> Updated notification list and badge count inside NgZone.');
            });
        } catch (e) {
            console.error('[WS] Cannot parse message:', body);
        }
    }

    markAsRead(id: number): void {
        this.notificationService.markAsRead(id).subscribe({
            next: () => {
                const current = this.notificationsSubject.getValue();
                const item = current.find(n => n.id === id);
                if (item && !item.isRead) {
                    item.isRead = true;
                    this.notificationsSubject.next([...current]);
                    const currentCount = this.unreadCountSubject.getValue();
                    if (currentCount > 0) {
                        this.unreadCountSubject.next(currentCount - 1);
                    }
                }
            },
            error: (err) => console.error('[WS] Failed to mark notification as read', err)
        });
    }

    markAllAsRead(): void {
        this.notificationService.markAllAsRead().subscribe({
            next: () => {
                this.unreadCountSubject.next(0);
                // Update local list to read
                const current = this.notificationsSubject.getValue();
                current.forEach(n => n.isRead = true);
                this.notificationsSubject.next([...current]);
            },
            error: (err) => console.error('[WS] Failed to mark notifications as read', err)
        });
    }

    disconnect(): void {
        if (this.stompClient) {
            this.stompClient.deactivate();
            this.connected = false;
        }
    }

    ngOnDestroy(): void {
        this.disconnect();
    }
}
