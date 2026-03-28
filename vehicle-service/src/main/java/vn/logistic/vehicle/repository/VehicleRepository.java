package vn.logistic.vehicle.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.logistic.vehicle.model.Vehicle;
import vn.logistic.vehicle.common.VehicleStatus;
import vn.logistic.vehicle.common.VehicleType;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    Optional<Vehicle> findByPlateNumber(String plateNumber);
    List<Vehicle> findByStatus(VehicleStatus status);
    List<Vehicle> findByTypeAndStatus(VehicleType type, VehicleStatus status);
}
