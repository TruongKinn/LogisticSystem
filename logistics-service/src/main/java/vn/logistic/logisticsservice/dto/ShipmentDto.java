package vn.logistic.logisticsservice.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

@Data
public class ShipmentDto {
    private Long id;
    private String shipmentCode;
    private String orderRef;
    private Long driverId;
    private Long vehicleId;
    private String status;
    private String senderName;
    private String receiverName;
    private BigDecimal weightKg;
    private String note;
    private Date createdAt;
}
