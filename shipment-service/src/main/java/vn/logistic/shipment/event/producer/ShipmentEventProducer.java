package vn.logistic.shipment.event.producer;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import vn.logistic.shipment.event.dto.DriverAssignedEvent;

import java.util.Map;

@Service
public class ShipmentEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public ShipmentEventProducer(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publishShipmentCreatedEvent(Map<String, Object> event) {
        kafkaTemplate.send("logistics.shipment.created", event);
    }

    public void publishStatusUpdatedEvent(Map<String, Object> event) {
        kafkaTemplate.send("logistics.shipment.status.updated", event);
    }

    public void publishDriverAssignedEvent(DriverAssignedEvent event) {
        kafkaTemplate.send("logistics.driver.assigned", event);
    }
}
