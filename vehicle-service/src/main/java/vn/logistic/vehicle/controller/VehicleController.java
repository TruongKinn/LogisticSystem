package vn.logistic.vehicle.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.logistic.vehicle.common.VehicleStatus;
import vn.logistic.vehicle.common.VehicleType;
import vn.logistic.vehicle.controller.request.CreateVehicleRequest;
import vn.logistic.vehicle.controller.response.VehicleResponse;
import vn.logistic.vehicle.service.VehicleService;

import java.util.List;

@RestController
@RequestMapping("/vehicle")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Vehicle Service Controller", description = "Quản lý thông tin phương tiện")
public class VehicleController {

    private final VehicleService vehicleService;

    @GetMapping
    @Operation(summary = "Lấy danh sách tất cả phương tiện")
    public ResponseEntity<List<VehicleResponse>> getAllVehicles() {
        return ResponseEntity.ok(vehicleService.getAllVehicles());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy thông tin phương tiện theo ID")
    public ResponseEntity<VehicleResponse> getVehicleById(@PathVariable Long id) {
        return ResponseEntity.ok(vehicleService.getVehicleById(id));
    }

    @GetMapping("/plate/{plateNumber}")
    @Operation(summary = "Lấy thông tin phương tiện theo biển số")
    public ResponseEntity<VehicleResponse> getVehicleByPlateNumber(@PathVariable String plateNumber) {
        return ResponseEntity.ok(vehicleService.getVehicleByPlateNumber(plateNumber));
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Lấy phương tiện theo trạng thái")
    public ResponseEntity<List<VehicleResponse>> getVehiclesByStatus(@PathVariable VehicleStatus status) {
        return ResponseEntity.ok(vehicleService.getVehiclesByStatus(status));
    }

    @GetMapping("/type/{type}/status/{status}")
    @Operation(summary = "Lấy phương tiện theo loại và trạng thái")
    public ResponseEntity<List<VehicleResponse>> getVehiclesByTypeAndStatus(
            @PathVariable VehicleType type, @PathVariable VehicleStatus status) {
        return ResponseEntity.ok(vehicleService.getVehiclesByTypeAndStatus(type, status));
    }

    @PostMapping
    @Operation(summary = "Tạo mới phương tiện")
    public ResponseEntity<VehicleResponse> createVehicle(@Valid @RequestBody CreateVehicleRequest request) {
        log.info("Create new vehicle: {}", request.getPlateNumber());
        return ResponseEntity.ok(vehicleService.createVehicle(request));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Cập nhật trạng thái phương tiện")
    public ResponseEntity<VehicleResponse> updateVehicleStatus(
            @PathVariable Long id, @RequestParam VehicleStatus status) {
        log.info("Update vehicle {} status to {}", id, status);
        return ResponseEntity.ok(vehicleService.updateStatus(id, status));
    }

    @PutMapping("/{id}/assign-driver/{driverId}")
    @Operation(summary = "Gán tài xế cho phương tiện")
    public ResponseEntity<VehicleResponse> assignDriver(
            @PathVariable Long id, @PathVariable Long driverId) {
        log.info("Assign driver {} to vehicle {}", driverId, id);
        return ResponseEntity.ok(vehicleService.assignDriver(id, driverId));
    }

    @PutMapping("/{id}/unassign-driver")
    @Operation(summary = "Hủy gán tài xế khỏi phương tiện")
    public ResponseEntity<VehicleResponse> unassignDriver(@PathVariable Long id) {
        log.info("Unassign driver from vehicle {}", id);
        return ResponseEntity.ok(vehicleService.unassignDriver(id));
    }
}
