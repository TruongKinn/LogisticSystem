package vn.logistic.vehicle.service;

import vn.logistic.vehicle.common.VehicleStatus;
import vn.logistic.vehicle.common.VehicleType;
import vn.logistic.vehicle.controller.request.CreateVehicleRequest;
import vn.logistic.vehicle.controller.response.VehicleResponse;

import java.util.List;

public interface VehicleService {
    List<VehicleResponse> getAllVehicles();
    VehicleResponse getVehicleById(Long id);
    VehicleResponse getVehicleByPlateNumber(String plateNumber);
    List<VehicleResponse> getVehiclesByStatus(VehicleStatus status);
    List<VehicleResponse> getVehiclesByTypeAndStatus(VehicleType type, VehicleStatus status);
    VehicleResponse createVehicle(CreateVehicleRequest request);
    VehicleResponse updateStatus(Long id, VehicleStatus status);
    VehicleResponse assignDriver(Long id, Long driverId);
    VehicleResponse unassignDriver(Long id);
}
