package vn.logistic.logisticsservice.service.impl;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import vn.logistic.logisticsservice.client.DriverClient;
import vn.logistic.logisticsservice.client.ShipmentClient;
import vn.logistic.logisticsservice.client.VehicleClient;
import vn.logistic.logisticsservice.dto.DriverDto;
import vn.logistic.logisticsservice.dto.OrchestratorResponse;
import vn.logistic.logisticsservice.dto.ShipmentDto;
import vn.logistic.logisticsservice.dto.VehicleDto;
import vn.logistic.logisticsservice.exception.BusinessConflictException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LogisticsServiceImplTest {

    @Mock
    private ShipmentClient shipmentClient;

    @Mock
    private DriverClient driverClient;

    @Mock
    private VehicleClient vehicleClient;

    @InjectMocks
    private LogisticsServiceImpl logisticsService;

    @Test
    void assignDelivery_shouldAssignResourcesInSafeOrder() {
        ShipmentDto shipment = shipment(10L, "SHP-001", "PENDING");
        DriverDto driver = driver(20L, "AVAILABLE");
        DriverDto busyDriver = driver(20L, "BUSY");
        VehicleDto vehicle = vehicle(30L, "AVAILABLE", null);
        VehicleDto assignedVehicle = vehicle(30L, "IN_USE", 20L);
        ShipmentDto assignedShipment = shipment(10L, "SHP-001", "ASSIGNED");
        assignedShipment.setDriverId(20L);
        assignedShipment.setVehicleId(30L);

        when(shipmentClient.getShipmentByCode("SHP-001")).thenReturn(shipment);
        when(driverClient.getDriverById(20L)).thenReturn(driver);
        when(vehicleClient.getVehicleById(30L)).thenReturn(vehicle);
        when(driverClient.updateDriverStatus(20L, "BUSY")).thenReturn(busyDriver);
        when(vehicleClient.updateVehicleStatus(30L, "IN_USE")).thenReturn(vehicle(30L, "IN_USE", null));
        when(vehicleClient.assignDriver(30L, 20L)).thenReturn(assignedVehicle);
        when(shipmentClient.assignDriverAndVehicle(10L, 20L, 30L)).thenReturn(assignedShipment);

        OrchestratorResponse response = logisticsService.assignDelivery("SHP-001", 20L, 30L);

        assertEquals("ASSIGNED", response.getShipment().getStatus());
        assertEquals("BUSY", response.getDriver().getStatus());
        assertEquals(20L, response.getVehicle().getCurrentDriverId());

        InOrder order = inOrder(shipmentClient, driverClient, vehicleClient);
        order.verify(shipmentClient).getShipmentByCode("SHP-001");
        order.verify(driverClient).getDriverById(20L);
        order.verify(vehicleClient).getVehicleById(30L);
        order.verify(driverClient).updateDriverStatus(20L, "BUSY");
        order.verify(vehicleClient).updateVehicleStatus(30L, "IN_USE");
        order.verify(vehicleClient).assignDriver(30L, 20L);
        order.verify(shipmentClient).assignDriverAndVehicle(10L, 20L, 30L);
    }

    @Test
    void assignDelivery_shouldCompensateWhenVehicleAssignmentFails() {
        ShipmentDto shipment = shipment(10L, "SHP-001", "PENDING");
        DriverDto driver = driver(20L, "AVAILABLE");
        DriverDto busyDriver = driver(20L, "BUSY");
        VehicleDto vehicle = vehicle(30L, "AVAILABLE", null);

        when(shipmentClient.getShipmentByCode("SHP-001")).thenReturn(shipment);
        when(driverClient.getDriverById(20L)).thenReturn(driver);
        when(vehicleClient.getVehicleById(30L)).thenReturn(vehicle);
        when(driverClient.updateDriverStatus(20L, "BUSY")).thenReturn(busyDriver);
        when(vehicleClient.updateVehicleStatus(30L, "IN_USE")).thenReturn(vehicle(30L, "IN_USE", null));
        when(vehicleClient.assignDriver(30L, 20L)).thenThrow(new RuntimeException("vehicle assignment failed"));

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> logisticsService.assignDelivery("SHP-001", 20L, 30L));

        assertEquals("vehicle assignment failed", exception.getMessage());
        verify(vehicleClient, never()).unassignDriver(30L);
        verify(vehicleClient).updateVehicleStatus(30L, "AVAILABLE");
        verify(driverClient).updateDriverStatus(20L, "AVAILABLE");
        verify(shipmentClient, never()).assignDriverAndVehicle(10L, 20L, 30L);
    }

    @Test
    void assignDelivery_shouldRejectNonPendingShipment() {
        when(shipmentClient.getShipmentByCode("SHP-002")).thenReturn(shipment(11L, "SHP-002", "ASSIGNED"));

        BusinessConflictException exception = assertThrows(
                BusinessConflictException.class,
                () -> logisticsService.assignDelivery("SHP-002", 20L, 30L));

        assertEquals("Shipment SHP-002 is in status ASSIGNED and cannot be assigned", exception.getMessage());
        verify(driverClient, never()).getDriverById(20L);
    }

    private ShipmentDto shipment(Long id, String code, String status) {
        ShipmentDto shipment = new ShipmentDto();
        shipment.setId(id);
        shipment.setShipmentCode(code);
        shipment.setStatus(status);
        return shipment;
    }

    private DriverDto driver(Long id, String status) {
        DriverDto driver = new DriverDto();
        driver.setId(id);
        driver.setStatus(status);
        return driver;
    }

    private VehicleDto vehicle(Long id, String status, Long currentDriverId) {
        VehicleDto vehicle = new VehicleDto();
        vehicle.setId(id);
        vehicle.setStatus(status);
        vehicle.setCurrentDriverId(currentDriverId);
        return vehicle;
    }
}
