package vn.logistic.tracking.service;

import vn.logistic.tracking.model.TrackingEvent;
import java.util.List;
import java.util.Map;

public interface TrackingService {
    List<TrackingEvent> getTrackingHistory(String shipmentCode);
    TrackingEvent getCurrentTracking(String shipmentCode);
    void saveTrackingEvent(Map<String, Object> eventData);
}
