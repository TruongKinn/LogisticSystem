package vn.logistic.vehicle.controller.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import vn.logistic.vehicle.common.VehicleType;

import java.math.BigDecimal;

@Data
public class CreateVehicleRequest {
    @NotBlank(message = "Plate number is mandatory")
    private String plateNumber;
    
    @NotNull(message = "Vehicle type is mandatory")
    private VehicleType type;
    
    private String brand;
    private String model;
    private BigDecimal maxWeightKg;
    private BigDecimal volumeM3;
    private Integer yearOfManufacture;
}
