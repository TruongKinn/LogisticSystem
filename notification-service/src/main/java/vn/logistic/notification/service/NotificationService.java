package vn.logistic.notification.service;

import vn.logistic.notification.dto.NotificationPageResponse;
import vn.logistic.notification.dto.NotificationRequest;
import vn.logistic.notification.event.dto.DriverAssignedEvent;

import java.util.Map;

public interface NotificationService {
    void processShipmentCreatedEvent(Map<String, Object> eventData);
    void processShipmentStatusUpdatedEvent(Map<String, Object> eventData);
    void processDriverAssignedEvent(DriverAssignedEvent eventData);
    NotificationPageResponse getHistory(int page, int size);
    long getUnreadCount();
    void markAllAsRead();
    void markAsRead(long id);
    String sendNotification(String message, String playerId);
    String sendWsNotification(NotificationRequest payload);
}
