package vn.logistic.logisticsservice.service;

import vn.logistic.logisticsservice.dto.OrchestratorResponse;

public interface LogisticsService {
    OrchestratorResponse assignDelivery(String shipmentCode, Long driverId, Long vehicleId);
    OrchestratorResponse getFullDeliveryInfo(String shipmentCode);
}
