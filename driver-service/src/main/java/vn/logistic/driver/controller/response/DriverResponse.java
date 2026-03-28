package vn.logistic.driver.controller.response;

import lombok.Builder;
import lombok.Data;
import vn.logistic.driver.common.DriverStatus;

import java.math.BigDecimal;
import java.util.Date;

@Data
@Builder
public class DriverResponse {
    private Long id;
    private String employeeCode;
    private String fullName;
    private String phone;
    private String email;
    private String licenseNo;
    private String licenseType;
    private DriverStatus status;
    private String zone;
    private BigDecimal rating;
    private Integer totalDeliveries;
    private Date createdAt;
}
