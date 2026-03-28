package vn.logistic.shipment.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.logistic.shipment.common.ShipmentStatus;
import vn.logistic.shipment.controller.request.CreateShipmentRequest;
import vn.logistic.shipment.controller.request.UpdateStatusRequest;
import vn.logistic.shipment.controller.response.ShipmentResponse;
import vn.logistic.shipment.service.ShipmentService;

import java.util.List;

@RestController
@RequestMapping("/shipment")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Shipment Service Controller", description = "Quản lý thông tin vận đơn")
public class ShipmentController {

    private final ShipmentService shipmentService;

    @GetMapping
    @Operation(summary = "Lấy danh sách tất cả vận đơn")
    public ResponseEntity<List<ShipmentResponse>> getAllShipments() {
        return ResponseEntity.ok(shipmentService.getAllShipments());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy thông tin vận đơn theo ID")
    public ResponseEntity<ShipmentResponse> getShipmentById(@PathVariable Long id) {
        return ResponseEntity.ok(shipmentService.getShipmentById(id));
    }

    @GetMapping("/code/{code}")
    @Operation(summary = "Lấy thông tin vận đơn theo mã vận đơn (Shipment Code)")
    public ResponseEntity<ShipmentResponse> getShipmentByCode(@PathVariable String code) {
        return ResponseEntity.ok(shipmentService.getShipmentByCode(code));
    }

    @GetMapping("/order/{orderRef}")
    @Operation(summary = "Lấy danh sách vận đơn theo mã đơn hàng (Order Ref)")
    public ResponseEntity<List<ShipmentResponse>> getShipmentsByOrderRef(@PathVariable String orderRef) {
        return ResponseEntity.ok(shipmentService.getShipmentsByOrderRef(orderRef));
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Lấy danh sách vận đơn theo trạng thái")
    public ResponseEntity<List<ShipmentResponse>> getShipmentsByStatus(@PathVariable ShipmentStatus status) {
        return ResponseEntity.ok(shipmentService.getShipmentsByStatus(status));
    }

    @GetMapping("/driver/{driverId}")
    @Operation(summary = "Lấy danh sách vận đơn theo ID tài xế")
    public ResponseEntity<List<ShipmentResponse>> getShipmentsByDriver(@PathVariable Long driverId) {
        return ResponseEntity.ok(shipmentService.getShipmentsByDriver(driverId));
    }

    @PostMapping
    @Operation(summary = "Tạo mới vận đơn")
    public ResponseEntity<ShipmentResponse> createShipment(@Valid @RequestBody CreateShipmentRequest request) {
        log.info("Create new shipment for order: {}", request.getOrderRef());
        return ResponseEntity.ok(shipmentService.createShipment(request));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Cập nhật trạng thái vận đơn")
    public ResponseEntity<ShipmentResponse> updateShipmentStatus(
            @PathVariable Long id, @Valid @RequestBody UpdateStatusRequest request) {
        log.info("Update shipment {} status", id);
        return ResponseEntity.ok(shipmentService.updateStatus(id, request));
    }

    @PutMapping("/{id}/assign")
    @Operation(summary = "Gán tài xế và phương tiện cho vận đơn")
    public ResponseEntity<ShipmentResponse> assignDriverAndVehicle(
            @PathVariable Long id,
            @RequestParam Long driverId,
            @RequestParam Long vehicleId) {
        log.info("Assign driver {} and vehicle {} to shipment {}", driverId, vehicleId, id);
        return ResponseEntity.ok(shipmentService.assignDriverAndVehicle(id, driverId, vehicleId));
    }
}
