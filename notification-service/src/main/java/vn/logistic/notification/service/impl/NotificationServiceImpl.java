package vn.logistic.notification.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import vn.logistic.notification.service.NotificationService;

import java.util.Map;

@Service
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    @Override
    public void processShipmentCreatedEvent(Map<String, Object> eventData) {
        log.info("Processing shipment created event for notification: {}", eventData);
        // TODO: In a real scenario, this would compose expanding email templates and sending emails.
        String shipmentCode = (String) eventData.get("shipmentCode");
        String senderName = (String) eventData.get("senderName");
        log.info("=> Sending email to sender ({}): Shipment {} has been created successfully.", senderName, shipmentCode);
    }

    @Override
    public void processShipmentStatusUpdatedEvent(Map<String, Object> eventData) {
        log.info("Processing shipment status updated event for notification: {}", eventData);
        String shipmentCode = (String) eventData.get("shipmentCode");
        String status = (String) eventData.get("status");
        log.info("=> Sending email: Shipment {} status updated to {}.", shipmentCode, status);
    }

    @Override
    public void processDriverAssignedEvent(Map<String, Object> eventData) {
        log.info("Processing driver assigned event for notification: {}", eventData);
        String shipmentCode = (String) eventData.get("shipmentCode");
        Long driverId = eventData.get("driverId") != null ? ((Number) eventData.get("driverId")).longValue() : null;
        log.info("=> Sending email/SMS to driver {}: Assigned to shipment {}.", driverId, shipmentCode);
    }
}
