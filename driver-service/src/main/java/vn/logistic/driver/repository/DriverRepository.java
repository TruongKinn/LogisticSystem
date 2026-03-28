package vn.logistic.driver.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.logistic.driver.model.Driver;
import vn.logistic.driver.common.DriverStatus;

import java.util.List;
import java.util.Optional;

@Repository
public interface DriverRepository extends JpaRepository<Driver, Long> {
    Optional<Driver> findByEmployeeCode(String employeeCode);
    List<Driver> findByStatus(DriverStatus status);
    List<Driver> findByZoneAndStatus(String zone, DriverStatus status);
}
