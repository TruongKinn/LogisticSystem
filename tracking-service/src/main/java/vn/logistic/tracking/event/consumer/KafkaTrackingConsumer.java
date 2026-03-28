package vn.logistic.tracking.event.consumer;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import vn.logistic.tracking.service.TrackingService;

import java.util.Map;

@Component
@Slf4j
@RequiredArgsConstructor
public class KafkaTrackingConsumer {

    private final TrackingService trackingService;

    @KafkaListener(topics = "${spring.kafka.topic.shipment-status-updated}", groupId = "${spring.kafka.consumer.group-id}")
    public void consumeShipmentStatusUpdated(Map<String, Object> eventData) {
        log.info("Received shipment status updated event: {}", eventData);
        trackingService.saveTrackingEvent(eventData);
    }
}
