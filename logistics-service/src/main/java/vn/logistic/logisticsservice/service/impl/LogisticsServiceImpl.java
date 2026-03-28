package vn.logistic.logisticsservice.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import vn.logistic.logisticsservice.client.DriverClient;
import vn.logistic.logisticsservice.client.ShipmentClient;
import vn.logistic.logisticsservice.client.VehicleClient;
import vn.logistic.logisticsservice.dto.DriverDto;
import vn.logistic.logisticsservice.dto.OrchestratorResponse;
import vn.logistic.logisticsservice.dto.ShipmentDto;
import vn.logistic.logisticsservice.dto.VehicleDto;
import vn.logistic.logisticsservice.service.LogisticsService;

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
        VehicleDto updatedVehicle = vehicleClient.updateVehicleStatus(vehicleId, "IN_USE");
        vehicleClient.assignDriver(vehicleId, driverId);

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
}
