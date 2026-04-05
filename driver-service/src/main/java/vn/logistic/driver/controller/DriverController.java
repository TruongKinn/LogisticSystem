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

    @PostMapping(value = "/import", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Import tài xế từ file Excel")
    public ResponseEntity<java.util.Map<String, Object>> importDrivers(@RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        log.info("Import drivers from file: {}", file.getOriginalFilename());
        int count = driverService.importDrivers(file);
        
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("message", "Successfully imported " + count + " drivers.");
        response.put("count", count);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/import-template")
    @Operation(summary = "Tải file Excel mẫu để import tài xế")
    public ResponseEntity<byte[]> downloadImportTemplate() {
        byte[] data = driverService.generateImportTemplate();
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.set(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=driver_import_template.xlsx");
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_OCTET_STREAM);
        return ResponseEntity.ok().headers(headers).body(data);
    }
}
