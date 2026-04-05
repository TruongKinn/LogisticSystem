package vn.logistic.shipment.event.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DriverAssignedPayload {
    private Long shipmentId;
    private String shipmentCode;
    private Long driverId;
    private Long vehicleId;
}
