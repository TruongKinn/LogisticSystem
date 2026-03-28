package vn.logistic.shipment.controller.response;

import lombok.Builder;
import lombok.Data;
import vn.logistic.shipment.common.ShipmentStatus;

import java.math.BigDecimal;
import java.util.Date;

@Data
@Builder
public class ShipmentResponse {
    private Long id;
    private String shipmentCode;
    private String orderRef;
    private Long driverId;
    private Long vehicleId;
    private ShipmentStatus status;
    private String senderName;
    private String senderPhone;
    private String senderAddress;
    private String receiverName;
    private String receiverPhone;
    private String receiverAddress;
    private BigDecimal weightKg;
    private BigDecimal codAmount;
    private String note;
    private Date estimatedAt;
    private Date deliveredAt;
    private Date createdAt;
}
