package vn.logistic.logisticsservice.dto;

import lombok.Data;

@Data
public class DriverDto {
    private Long id;
    private String employeeCode;
    private String fullName;
    private String phone;
    private String status;
    private String zone;
}
