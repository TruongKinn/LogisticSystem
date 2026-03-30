package vn.logistic.notification.service;

import vn.logistic.notification.dto.NotificationPageResponse;
import vn.logistic.notification.dto.NotificationRequest;

import java.util.Map;

public interface NotificationService {
    void processShipmentCreatedEvent(Map<String, Object> eventData);
    void processShipmentStatusUpdatedEvent(Map<String, Object> eventData);
    void processDriverAssignedEvent(Map<String, Object> eventData);
    NotificationPageResponse getHistory(int page, int size);
    long getUnreadCount();
    void markAllAsRead();
    void markAsRead(long id);
    String sendNotification(String message, String playerId);
    String sendWsNotification(NotificationRequest payload);
}
