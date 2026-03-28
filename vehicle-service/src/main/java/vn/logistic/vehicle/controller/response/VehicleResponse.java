package vn.logistic.vehicle.controller.response;

import lombok.Builder;
import lombok.Data;
import vn.logistic.vehicle.common.VehicleStatus;
import vn.logistic.vehicle.common.VehicleType;

import java.math.BigDecimal;
import java.util.Date;

@Data
@Builder
public class VehicleResponse {
    private Long id;
    private String plateNumber;
    private VehicleType type;
    private String brand;
    private String model;
    private BigDecimal maxWeightKg;
    private BigDecimal volumeM3;
    private VehicleStatus status;
    private Long currentDriverId;
    private Integer yearOfManufacture;
    private Date createdAt;
}
