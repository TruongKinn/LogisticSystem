package vn.logistic.logisticsservice.service;

import vn.logistic.logisticsservice.dto.OrchestratorResponse;
import vn.logistic.logisticsservice.dto.SagaTransactionResponse;

import java.util.List;

public interface LogisticsService {
    OrchestratorResponse assignDelivery(String shipmentCode, Long driverId, Long vehicleId);
    OrchestratorResponse getFullDeliveryInfo(String shipmentCode);
    List<SagaTransactionResponse> getSagaTransactions();
    SagaTransactionResponse getSagaTransaction(String id);
}
