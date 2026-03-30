package vn.logistic.logisticsservice.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import vn.logistic.logisticsservice.client.DriverClient;
import vn.logistic.logisticsservice.client.ShipmentClient;
import vn.logistic.logisticsservice.client.VehicleClient;
import vn.logistic.logisticsservice.dto.DriverDto;
import vn.logistic.logisticsservice.dto.OrchestratorResponse;
import vn.logistic.logisticsservice.dto.SagaTransactionResponse;
import vn.logistic.logisticsservice.dto.ShipmentDto;
import vn.logistic.logisticsservice.dto.VehicleDto;
import vn.logistic.logisticsservice.service.LogisticsService;

import java.util.ArrayList;
import java.util.List;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@Slf4j
@RequiredArgsConstructor
public class LogisticsServiceImpl implements LogisticsService {

    private final ShipmentClient shipmentClient;
    private final DriverClient driverClient;
    private final VehicleClient vehicleClient;

    @Override
    public OrchestratorResponse assignDelivery(String shipmentCode, Long driverId, Long vehicleId) {
        log.info("Process assign delivery: shipment={}, driver={}, vehicle={}", shipmentCode, driverId, vehicleId);

        // 1. Get current shipment
        ShipmentDto shipment = shipmentClient.getShipmentByCode(shipmentCode);

        // 2. Assign Driver & Vehicle in Shipment Service
        ShipmentDto updatedShipment = shipmentClient.assignDriverAndVehicle(shipment.getId(), driverId, vehicleId);

        // 3. Update Driver Status to BUSY
        DriverDto updatedDriver = driverClient.updateDriverStatus(driverId, "BUSY");

        // 4. Update Vehicle Status to IN_USE and Assign Driver to Vehicle
        vehicleClient.updateVehicleStatus(vehicleId, "IN_USE");
        VehicleDto updatedVehicle = vehicleClient.assignDriver(vehicleId, driverId);

        return OrchestratorResponse.builder()
                .shipment(updatedShipment)
                .driver(updatedDriver)
                .vehicle(updatedVehicle)
                .build();
    }

    @Override
    public OrchestratorResponse getFullDeliveryInfo(String shipmentCode) {
        ShipmentDto shipment = shipmentClient.getShipmentByCode(shipmentCode);
        
        DriverDto driver = null;
        if (shipment.getDriverId() != null) {
            driver = driverClient.getDriverById(shipment.getDriverId());
        }

        VehicleDto vehicle = null;
        if (shipment.getVehicleId() != null) {
            vehicle = vehicleClient.getVehicleById(shipment.getVehicleId());
        }

        return OrchestratorResponse.builder()
                .shipment(shipment)
                .driver(driver)
                .vehicle(vehicle)
                .build();
    }

    @Override
    public List<SagaTransactionResponse> getSagaTransactions() {
        return shipmentClient.getAllShipments().stream()
                .map(this::toSagaTransaction)
                .toList();
    }

    @Override
    public SagaTransactionResponse getSagaTransaction(String id) {
        return shipmentClient.getAllShipments().stream()
                .filter(shipment -> String.valueOf(shipment.getId()).equals(id) || shipment.getShipmentCode().equals(id))
                .findFirst()
                .map(this::toSagaTransaction)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Saga transaction not found: " + id));
    }

    private SagaTransactionResponse toSagaTransaction(ShipmentDto shipment) {
        List<String> logs = new ArrayList<>();
        logs.add("Shipment code: " + shipment.getShipmentCode());
        logs.add("Order ref: " + shipment.getOrderRef());
        logs.add("Current shipment status: " + shipment.getStatus());
        if (shipment.getDriverId() != null) {
            logs.add("Assigned driver ID: " + shipment.getDriverId());
        }
        if (shipment.getVehicleId() != null) {
            logs.add("Assigned vehicle ID: " + shipment.getVehicleId());
        }

        return SagaTransactionResponse.builder()
                .id(String.valueOf(shipment.getId()))
                .orderId(shipment.getOrderRef())
                .status(toSagaStatus(shipment.getStatus()))
                .currentStep(toCurrentStep(shipment.getStatus()))
                .logs(logs)
                .createdAt(shipment.getCreatedAt())
                .updatedAt(shipment.getCreatedAt())
                .build();
    }

    private String toSagaStatus(String shipmentStatus) {
        return switch (shipmentStatus) {
            case "DELIVERED" -> "SUCCESS";
            case "FAILED", "RETURNED" -> "FAILED";
            default -> "STARTED";
        };
    }

    private String toCurrentStep(String shipmentStatus) {
        return switch (shipmentStatus) {
            case "PENDING" -> "CREATE_SHIPMENT";
            case "ASSIGNED" -> "ASSIGN_DRIVER_VEHICLE";
            case "PICKED_UP" -> "PICKUP";
            case "IN_TRANSIT" -> "IN_TRANSIT";
            case "OUT_FOR_DELIVERY" -> "OUT_FOR_DELIVERY";
            case "DELIVERED" -> "COMPLETE_DELIVERY";
            case "FAILED" -> "FAILED";
            case "RETURNED" -> "RETURN_SHIPMENT";
            default -> shipmentStatus;
        };
    }
}
