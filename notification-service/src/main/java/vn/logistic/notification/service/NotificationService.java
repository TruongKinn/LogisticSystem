package vn.logistic.notification.service;

import java.util.Map;

public interface NotificationService {
    void processShipmentCreatedEvent(Map<String, Object> eventData);
    void processShipmentStatusUpdatedEvent(Map<String, Object> eventData);
    void processDriverAssignedEvent(Map<String, Object> eventData);
}
