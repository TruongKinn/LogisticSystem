package vn.logistic.shipment.controller.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateShipmentRequest {
    @NotBlank(message = "Order reference is mandatory")
    private String orderRef;
    
    @NotBlank(message = "Sender name is mandatory")
    private String senderName;
    private String senderPhone;
    private String senderAddress;
    
    @NotBlank(message = "Receiver name is mandatory")
    private String receiverName;
    
    @NotBlank(message = "Receiver phone is mandatory")
    private String receiverPhone;
    
    @NotBlank(message = "Receiver address is mandatory")
    private String receiverAddress;
    
    private BigDecimal weightKg;
    private BigDecimal codAmount;
    private String note;
}
