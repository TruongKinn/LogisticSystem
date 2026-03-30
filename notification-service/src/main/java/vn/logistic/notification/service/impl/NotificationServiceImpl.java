package vn.logistic.notification.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import vn.logistic.notification.service.NotificationService;
import vn.logistic.notification.dto.NotificationDto;
import vn.logistic.notification.dto.NotificationPageResponse;
import vn.logistic.notification.dto.NotificationRequest;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicLong;

@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    private final AtomicLong idGenerator = new AtomicLong(0);
    private final CopyOnWriteArrayList<NotificationDto> notifications = new CopyOnWriteArrayList<>();

    @Override
    public void processShipmentCreatedEvent(Map<String, Object> eventData) {
        log.info("Processing shipment created event for notification: {}", eventData);
        String shipmentCode = (String) eventData.get("shipmentCode");
        String senderName = (String) eventData.get("senderName");
        createAndBroadcast(NotificationRequest.builder()
                .recipientId("logistics-team")
                .type("SHIPMENT_CREATED")
                .title("Shipment Created")
                .message("Shipment " + shipmentCode + " was created for sender " + senderName + ".")
                .referenceId(shipmentCode)
                .build());
        log.info("=> Sending email to sender ({}): Shipment {} has been created successfully.", senderName, shipmentCode);
    }

    @Override
    public void processShipmentStatusUpdatedEvent(Map<String, Object> eventData) {
        log.info("Processing shipment status updated event for notification: {}", eventData);
        String shipmentCode = (String) eventData.get("shipmentCode");
        String status = (String) eventData.get("status");
        createAndBroadcast(NotificationRequest.builder()
                .recipientId("logistics-team")
                .type("SHIPMENT_STATUS_UPDATED")
                .title("Shipment Status Updated")
                .message("Shipment " + shipmentCode + " status updated to " + status + ".")
                .referenceId(shipmentCode)
                .build());
        log.info("=> Sending email: Shipment {} status updated to {}.", shipmentCode, status);
    }

    @Override
    public void processDriverAssignedEvent(Map<String, Object> eventData) {
        log.info("Processing driver assigned event for notification: {}", eventData);
        String shipmentCode = (String) eventData.get("shipmentCode");
        Long driverId = eventData.get("driverId") != null ? ((Number) eventData.get("driverId")).longValue() : null;
        createAndBroadcast(NotificationRequest.builder()
                .recipientId(driverId != null ? String.valueOf(driverId) : "logistics-team")
                .type("DRIVER_ASSIGNED")
                .title("Driver Assigned")
                .message("Driver " + driverId + " assigned to shipment " + shipmentCode + ".")
                .referenceId(shipmentCode)
                .build());
        log.info("=> Sending email/SMS to driver {}: Assigned to shipment {}.", driverId, shipmentCode);
    }

    @Override
    public NotificationPageResponse getHistory(int page, int size) {
        int safePage = Math.max(page, 1);
        int safeSize = Math.max(size, 1);

        List<NotificationDto> sorted = notifications.stream()
                .sorted(Comparator.comparing(NotificationDto::getCreatedAt).reversed())
                .toList();

        int fromIndex = Math.min((safePage - 1) * safeSize, sorted.size());
        int toIndex = Math.min(fromIndex + safeSize, sorted.size());

        return NotificationPageResponse.builder()
                .page(safePage)
                .size(safeSize)
                .total(sorted.size())
                .items(new ArrayList<>(sorted.subList(fromIndex, toIndex)))
                .build();
    }

    @Override
    public long getUnreadCount() {
        return notifications.stream().filter(notification -> !notification.isRead()).count();
    }

    @Override
    public void markAllAsRead() {
        notifications.forEach(notification -> notification.setRead(true));
    }

    @Override
    public void markAsRead(long id) {
        notifications.stream()
                .filter(notification -> notification.getId() == id)
                .findFirst()
                .ifPresent(notification -> notification.setRead(true));
    }

    @Override
    public String sendNotification(String message, String playerId) {
        createAndBroadcast(NotificationRequest.builder()
                .recipientId(playerId)
                .type("GENERAL")
                .title("Manual Notification")
                .message(message)
                .referenceId(playerId)
                .build());
        return "Notification sent";
    }

    @Override
    public String sendWsNotification(NotificationRequest payload) {
        createAndBroadcast(payload);
        return "WebSocket notification sent";
    }

    private void createAndBroadcast(NotificationRequest request) {
        NotificationDto notification = NotificationDto.builder()
                .id(idGenerator.incrementAndGet())
                .message(request.getMessage())
                .recipientId(request.getRecipientId() == null || request.getRecipientId().isBlank() ? "broadcast" : request.getRecipientId())
                .type(request.getType() == null || request.getType().isBlank() ? "GENERAL" : request.getType())
                .title(request.getTitle() == null || request.getTitle().isBlank() ? "Notification" : request.getTitle())
                .referenceId(request.getReferenceId())
                .provider("WEBSOCKET")
                .status("SUCCESS")
                .createdAt(Instant.now())
                .isRead(false)
                .build();

        notifications.add(notification);
        messagingTemplate.convertAndSend("/topic/notifications", notification);
        messagingTemplate.convertAndSend("/topic/notifications/" + notification.getRecipientId(), notification);
    }
}
