package vn.logistic.logisticsservice.controller.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class AssignDeliveryRequest {

    @NotBlank(message = "shipmentCode must not be blank")
    private String shipmentCode;

    @NotNull(message = "driverId must not be null")
    @Positive(message = "driverId must be greater than 0")
    private Long driverId;

    @NotNull(message = "vehicleId must not be null")
    @Positive(message = "vehicleId must be greater than 0")
    private Long vehicleId;
}
