package vn.logistic.driver.service;

import vn.logistic.driver.controller.request.CreateDriverRequest;
import vn.logistic.driver.controller.response.DriverResponse;
import vn.logistic.driver.common.DriverStatus;

import java.util.List;

public interface DriverService {
    List<DriverResponse> getAllDrivers();
    DriverResponse getDriverById(Long id);
    DriverResponse getDriverByEmployeeCode(String employeeCode);
    List<DriverResponse> getDriversByStatus(DriverStatus status);
    List<DriverResponse> getAvailableDriversByZone(String zone);
    DriverResponse createDriver(CreateDriverRequest request);
    DriverResponse updateStatus(Long id, DriverStatus status);
    int importDrivers(org.springframework.web.multipart.MultipartFile file);
    byte[] generateImportTemplate();
}
