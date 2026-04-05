package vn.logistic.driver.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import vn.logistic.driver.common.DriverStatus;
import vn.logistic.driver.controller.request.CreateDriverRequest;
import vn.logistic.driver.controller.response.DriverResponse;
import vn.logistic.driver.exception.BusinessConflictException;
import vn.logistic.driver.exception.ResourceNotFoundException;
import vn.logistic.driver.model.Driver;
import vn.logistic.driver.repository.DriverRepository;
import vn.logistic.driver.service.DriverService;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class DriverServiceImpl implements DriverService {

    private final DriverRepository driverRepository;

    @Override
    public List<DriverResponse> getAllDrivers() {
        return driverRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public DriverResponse getDriverById(Long id) {
        return driverRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found: " + id));
    }

    @Override
    public DriverResponse getDriverByEmployeeCode(String employeeCode) {
        return driverRepository.findByEmployeeCode(employeeCode)
                .map(this::mapToResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found by employeeCode: " + employeeCode));
    }

    @Override
    public List<DriverResponse> getDriversByStatus(DriverStatus status) {
        return driverRepository.findByStatus(status).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<DriverResponse> getAvailableDriversByZone(String zone) {
        return driverRepository.findByZoneAndStatus(zone, DriverStatus.AVAILABLE).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public DriverResponse createDriver(CreateDriverRequest request) {
        Driver driver = Driver.builder()
                .employeeCode(request.getEmployeeCode())
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .email(request.getEmail())
                .licenseNo(request.getLicenseNo())
                .licenseType(request.getLicenseType())
                .zone(request.getZone())
                .status(DriverStatus.AVAILABLE)
                .rating(BigDecimal.valueOf(5.0))
                .totalDeliveries(0)
                .build();

        Driver savedDriver = driverRepository.save(driver);
        return mapToResponse(savedDriver);
    }

    @Override
    public DriverResponse updateStatus(Long id, DriverStatus status) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found: " + id));

        if (status == DriverStatus.BUSY && driver.getStatus() != DriverStatus.AVAILABLE) {
            throw new BusinessConflictException(
                    "Driver " + id + " is in status " + driver.getStatus() + " and cannot be moved to BUSY");
        }

        driver.setStatus(status);
        return mapToResponse(driverRepository.save(driver));
    }

    private DriverResponse mapToResponse(Driver driver) {
        return DriverResponse.builder()
                .id(driver.getId())
                .employeeCode(driver.getEmployeeCode())
                .fullName(driver.getFullName())
                .phone(driver.getPhone())
                .email(driver.getEmail())
                .licenseNo(driver.getLicenseNo())
                .licenseType(driver.getLicenseType())
                .status(driver.getStatus())
                .zone(driver.getZone())
                .rating(driver.getRating())
                .totalDeliveries(driver.getTotalDeliveries())
                .createdAt(driver.getCreatedAt())
                .build();
    }
}
