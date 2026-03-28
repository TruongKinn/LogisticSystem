package vn.logistic.tracking.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import vn.logistic.tracking.model.TrackingEvent;
import vn.logistic.tracking.repository.TrackingEventRepository;
import vn.logistic.tracking.service.TrackingService;

import java.util.Date;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class TrackingServiceImpl implements TrackingService {

    private final TrackingEventRepository eventRepository;

    @Override
    public List<TrackingEvent> getTrackingHistory(String shipmentCode) {
        return eventRepository.findByShipmentCodeOrderByTimestampDesc(shipmentCode);
    }

    @Override
    public TrackingEvent getCurrentTracking(String shipmentCode) {
        List<TrackingEvent> history = eventRepository.findByShipmentCodeOrderByTimestampDesc(shipmentCode);
        if (history != null && !history.isEmpty()) {
            return history.get(0);
        }
        return null;
    }

    @Override
    public void saveTrackingEvent(Map<String, Object> eventData) {
        try {
            Long shipmentId = eventData.get("shipmentId") != null ? ((Number) eventData.get("shipmentId")).longValue() : null;
            String shipmentCode = (String) eventData.get("shipmentCode");
            String status = (String) eventData.get("status");
            String note = (String) eventData.get("note");
            
            TrackingEvent trackingEvent = TrackingEvent.builder()
                    .shipmentId(shipmentId)
                    .shipmentCode(shipmentCode)
                    .status(status)
                    .note(note)
                    .timestamp(new Date())
                    .build();
            
            eventRepository.save(trackingEvent);
            log.info("Saved tracking event for shipment {} with status {}", shipmentCode, status);
        } catch (Exception e) {
            log.error("Error saving tracking event", e);
        }
    }
}
