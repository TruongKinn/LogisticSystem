package vn.logistic.notification.event.consumer;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import vn.logistic.notification.event.dto.DriverAssignedEvent;
import vn.logistic.notification.service.NotificationService;

import java.util.Map;

@Component
@Slf4j
@RequiredArgsConstructor
public class KafkaNotificationConsumer {

    private final NotificationService notificationService;

    @KafkaListener(topics = "${spring.kafka.topic.shipment-created}", groupId = "${spring.kafka.consumer.group-id}")
    public void consumeShipmentCreated(Map<String, Object> eventData) {
        log.info("Kafka Consumer - Received shipment created event");
        notificationService.processShipmentCreatedEvent(eventData);
    }

    @KafkaListener(topics = "${spring.kafka.topic.shipment-status-updated}", groupId = "${spring.kafka.consumer.group-id}")
    public void consumeShipmentStatusUpdated(Map<String, Object> eventData) {
        log.info("Kafka Consumer - Received shipment status updated event");
        notificationService.processShipmentStatusUpdatedEvent(eventData);
    }

    @KafkaListener(topics = "${spring.kafka.topic.driver-assigned}", groupId = "${spring.kafka.consumer.group-id}")
    public void consumeDriverAssigned(DriverAssignedEvent eventData) {
        log.info("Kafka Consumer - Received driver assigned event");
        notificationService.processDriverAssignedEvent(eventData);
    }
}
