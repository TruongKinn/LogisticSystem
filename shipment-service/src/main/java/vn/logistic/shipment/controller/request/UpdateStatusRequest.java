package vn.logistic.shipment.controller.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import vn.logistic.shipment.common.ShipmentStatus;

@Data
public class UpdateStatusRequest {
    @NotNull(message = "Status cannot be null")
    private ShipmentStatus status;
    private String note;
}
