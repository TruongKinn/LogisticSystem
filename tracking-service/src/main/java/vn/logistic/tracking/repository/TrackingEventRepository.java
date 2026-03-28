package vn.logistic.tracking.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import vn.logistic.tracking.model.TrackingEvent;

import java.util.List;

@Repository
public interface TrackingEventRepository extends MongoRepository<TrackingEvent, String> {
    List<TrackingEvent> findByShipmentCodeOrderByTimestampDesc(String shipmentCode);
    List<TrackingEvent> findByShipmentIdOrderByTimestampDesc(Long shipmentId);
}
