package vn.logistic.shipment.service;

import vn.logistic.shipment.common.ShipmentStatus;
import vn.logistic.shipment.controller.request.CreateShipmentRequest;
import vn.logistic.shipment.controller.request.UpdateStatusRequest;
import vn.logistic.shipment.controller.response.ShipmentResponse;

import java.util.List;

public interface ShipmentService {
    List<ShipmentResponse> getAllShipments();
    ShipmentResponse getShipmentById(Long id);
    ShipmentResponse getShipmentByCode(String code);
    List<ShipmentResponse> getShipmentsByOrderRef(String orderRef);
    List<ShipmentResponse> getShipmentsByStatus(ShipmentStatus status);
    List<ShipmentResponse> getShipmentsByDriver(Long driverId);
    
    ShipmentResponse createShipment(CreateShipmentRequest request);
    ShipmentResponse updateStatus(Long id, UpdateStatusRequest request);
    ShipmentResponse assignDriverAndVehicle(Long id, Long driverId, Long vehicleId);
    ShipmentResponse unassignDriverAndVehicle(Long id);
}
