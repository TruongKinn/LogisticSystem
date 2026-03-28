package vn.logistic.logisticsservice.dto;

import lombok.Data;

@Data
public class VehicleDto {
    private Long id;
    private String plateNumber;
    private String type;
    private String status;
    private Long currentDriverId;
}
