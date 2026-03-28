package vn.logistic.tracking.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.logistic.tracking.model.TrackingEvent;
import vn.logistic.tracking.service.TrackingService;

import java.util.List;

@RestController
@RequestMapping("/tracking")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Tracking Service Controller", description = "Quản lý và tra cứu lịch sử hành trình vận chuyển")
public class TrackingController {

    private final TrackingService trackingService;

    @GetMapping("/shipment/{shipmentCode}/history")
    @Operation(summary = "Lấy toàn bộ lịch sử hành trình của một vận đơn")
    public ResponseEntity<List<TrackingEvent>> getTrackingHistory(@PathVariable String shipmentCode) {
        return ResponseEntity.ok(trackingService.getTrackingHistory(shipmentCode));
    }

    @GetMapping("/shipment/{shipmentCode}/current")
    @Operation(summary = "Lấy trạng thái hiện hành mới nhất của một vận đơn")
    public ResponseEntity<TrackingEvent> getCurrentTracking(@PathVariable String shipmentCode) {
        TrackingEvent current = trackingService.getCurrentTracking(shipmentCode);
        if (current != null) {
            return ResponseEntity.ok(current);
        }
        return ResponseEntity.notFound().build();
    }
}
