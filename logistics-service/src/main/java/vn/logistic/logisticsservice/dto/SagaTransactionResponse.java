package vn.logistic.logisticsservice.dto;

import lombok.Builder;
import lombok.Data;

import java.util.Date;
import java.util.List;

@Data
@Builder
public class SagaTransactionResponse {
    private String id;
    private String orderId;
    private String status;
    private String currentStep;
    private List<String> logs;
    private Date createdAt;
    private Date updatedAt;
}
