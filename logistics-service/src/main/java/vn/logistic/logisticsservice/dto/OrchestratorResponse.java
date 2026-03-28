package vn.logistic.logisticsservice.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrchestratorResponse {
    private ShipmentDto shipment;
    private DriverDto driver;
    private VehicleDto vehicle;
}
