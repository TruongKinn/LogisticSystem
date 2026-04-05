package vn.logistic.logisticsservice.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vn.logistic.logisticsservice.controller.request.AssignDeliveryRequest;
import vn.logistic.logisticsservice.dto.OrchestratorResponse;
import vn.logistic.logisticsservice.service.LogisticsService;

@RestController
@RequestMapping("/logistics")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Logistics Orchestrator Controller", description = "Orchestrates cross-service logistics flows")
public class LogisticsController {

    private final LogisticsService logisticsService;

    @PostMapping("/api/v1/delivery-assignments")
    @Operation(summary = "Assign driver and vehicle to shipment")
    public ResponseEntity<OrchestratorResponse> assignDeliveryV1(@Valid @RequestBody AssignDeliveryRequest request) {
        log.info("Assign delivery request: shipmentCode={}, driverId={}, vehicleId={}",
                request.getShipmentCode(), request.getDriverId(), request.getVehicleId());
        return ResponseEntity.ok(
                logisticsService.assignDelivery(request.getShipmentCode(), request.getDriverId(), request.getVehicleId()));
    }

    @PostMapping("/assign")
    @Operation(summary = "Legacy assign delivery endpoint")
    public ResponseEntity<OrchestratorResponse> assignDelivery(
            @RequestParam String shipmentCode,
            @RequestParam Long driverId,
            @RequestParam Long vehicleId) {
        log.info("Assign delivery request: shipmentCode={}, driverId={}, vehicleId={}", shipmentCode, driverId, vehicleId);
        return ResponseEntity.ok(logisticsService.assignDelivery(shipmentCode, driverId, vehicleId));
    }

    @GetMapping("/info/{shipmentCode}")
    @Operation(summary = "Get delivery information")
    public ResponseEntity<OrchestratorResponse> getFullDeliveryInfo(@PathVariable String shipmentCode) {
        return ResponseEntity.ok(logisticsService.getFullDeliveryInfo(shipmentCode));
    }
}
