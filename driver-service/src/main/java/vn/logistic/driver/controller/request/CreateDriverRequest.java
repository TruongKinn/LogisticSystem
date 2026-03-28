package vn.logistic.driver.controller.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateDriverRequest {
    @NotBlank(message = "Employee code is mandatory")
    private String employeeCode;
    
    @NotBlank(message = "Full name is mandatory")
    private String fullName;
    
    @NotBlank(message = "Phone number is mandatory")
    private String phone;
    
    private String email;
    private String licenseNo;
    private String licenseType;
    private String zone;
}
