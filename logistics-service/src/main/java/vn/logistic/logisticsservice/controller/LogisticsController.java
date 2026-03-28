package vn.logistic.logisticsservice.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.logistic.logisticsservice.dto.OrchestratorResponse;
import vn.logistic.logisticsservice.service.LogisticsService;

@RestController
@RequestMapping("/logistics")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Logistics Orchestrator Controller", description = "Điều phối API tổng hợp cho Logistics")
public class LogisticsController {

    private final LogisticsService logisticsService;

    @PostMapping("/assign")
    @Operation(summary = "Điều phối gán tài xế & phương tiện cho vận đơn")
    public ResponseEntity<OrchestratorResponse> assignDelivery(
            @RequestParam String shipmentCode,
            @RequestParam Long driverId,
            @RequestParam Long vehicleId) {
        log.info("Assign delivery request: shipmentCode={}, driverId={}, vehicleId={}", shipmentCode, driverId, vehicleId);
        return ResponseEntity.ok(logisticsService.assignDelivery(shipmentCode, driverId, vehicleId));
    }

    @GetMapping("/info/{shipmentCode}")
    @Operation(summary = "Tra cứu thông tin tổng hợp của vận đơn")
    public ResponseEntity<OrchestratorResponse> getFullDeliveryInfo(@PathVariable String shipmentCode) {
        return ResponseEntity.ok(logisticsService.getFullDeliveryInfo(shipmentCode));
    }
}
