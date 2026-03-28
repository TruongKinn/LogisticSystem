package vn.logistic.driver.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.logistic.driver.common.DriverStatus;
import vn.logistic.driver.controller.request.CreateDriverRequest;
import vn.logistic.driver.controller.response.DriverResponse;
import vn.logistic.driver.service.DriverService;

import java.util.List;

@RestController
@RequestMapping("/driver")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Driver Service Controller", description = "Quản lý thông tin tài xế")
public class DriverController {

    private final DriverService driverService;

    @GetMapping
    @Operation(summary = "Lấy danh sách tất cả tài xế")
    public ResponseEntity<List<DriverResponse>> getAllDrivers() {
        return ResponseEntity.ok(driverService.getAllDrivers());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy thông tin nhận diện tài xế theo ID")
    public ResponseEntity<DriverResponse> getDriverById(@PathVariable Long id) {
        return ResponseEntity.ok(driverService.getDriverById(id));
    }

    @GetMapping("/code/{employeeCode}")
    @Operation(summary = "Lấy thông tin tài xế theo Employee Code")
    public ResponseEntity<DriverResponse> getDriverByCode(@PathVariable String employeeCode) {
        return ResponseEntity.ok(driverService.getDriverByEmployeeCode(employeeCode));
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Lấy tài xế theo trạng thái")
    public ResponseEntity<List<DriverResponse>> getDriversByStatus(@PathVariable DriverStatus status) {
        return ResponseEntity.ok(driverService.getDriversByStatus(status));
    }

    @GetMapping("/zone/{zone}/available")
    @Operation(summary = "Lấy các tài xế AVAILABLE tại Zone cụ thể")
    public ResponseEntity<List<DriverResponse>> getAvailableDriversByZone(@PathVariable String zone) {
        return ResponseEntity.ok(driverService.getAvailableDriversByZone(zone));
    }

    @PostMapping
    @Operation(summary = "Tạo mới tài xế")
    public ResponseEntity<DriverResponse> createDriver(@Valid @RequestBody CreateDriverRequest request) {
        log.info("Create new driver: {}", request.getEmployeeCode());
        return ResponseEntity.ok(driverService.createDriver(request));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Cập nhật trạng thái tài xế")
    public ResponseEntity<DriverResponse> updateDriverStatus(@PathVariable Long id, @RequestParam DriverStatus status) {
        log.info("Update driver {} status to {}", id, status);
        return ResponseEntity.ok(driverService.updateStatus(id, status));
    }
}
