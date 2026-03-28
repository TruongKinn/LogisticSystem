package vn.logistic.shipment.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.logistic.shipment.model.Shipment;
import vn.logistic.shipment.common.ShipmentStatus;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, Long> {
    Optional<Shipment> findByShipmentCode(String shipmentCode);
    List<Shipment> findByOrderRef(String orderRef);
    List<Shipment> findByStatus(ShipmentStatus status);
    List<Shipment> findByDriverId(Long driverId);
}
