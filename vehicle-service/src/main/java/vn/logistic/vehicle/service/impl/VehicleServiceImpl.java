package vn.logistic.vehicle.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import vn.logistic.vehicle.common.VehicleStatus;
import vn.logistic.vehicle.common.VehicleType;
import vn.logistic.vehicle.controller.request.CreateVehicleRequest;
import vn.logistic.vehicle.controller.response.VehicleResponse;
import vn.logistic.vehicle.model.Vehicle;
import vn.logistic.vehicle.repository.VehicleRepository;
import vn.logistic.vehicle.service.VehicleService;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class VehicleServiceImpl implements VehicleService {

    private final VehicleRepository vehicleRepository;

    @Override
    public List<VehicleResponse> getAllVehicles() {
        return vehicleRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public VehicleResponse getVehicleById(Long id) {
        return vehicleRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
    }

    @Override
    public VehicleResponse getVehicleByPlateNumber(String plateNumber) {
        return vehicleRepository.findByPlateNumber(plateNumber)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
    }

    @Override
    public List<VehicleResponse> getVehiclesByStatus(VehicleStatus status) {
        return vehicleRepository.findByStatus(status).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<VehicleResponse> getVehiclesByTypeAndStatus(VehicleType type, VehicleStatus status) {
        return vehicleRepository.findByTypeAndStatus(type, status).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public VehicleResponse createVehicle(CreateVehicleRequest request) {
        Vehicle vehicle = Vehicle.builder()
                .plateNumber(request.getPlateNumber())
                .type(request.getType())
                .brand(request.getBrand())
                .model(request.getModel())
                .maxWeightKg(request.getMaxWeightKg())
                .volumeM3(request.getVolumeM3())
                .yearOfManufacture(request.getYearOfManufacture())
                .status(VehicleStatus.AVAILABLE)
                .build();
                
        Vehicle savedVehicle = vehicleRepository.save(vehicle);
        return mapToResponse(savedVehicle);
    }

    @Override
    public VehicleResponse updateStatus(Long id, VehicleStatus status) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
        vehicle.setStatus(status);
        return mapToResponse(vehicleRepository.save(vehicle));
    }

    @Override
    public VehicleResponse assignDriver(Long id, Long driverId) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
        vehicle.setCurrentDriverId(driverId);
        return mapToResponse(vehicleRepository.save(vehicle));
    }

    @Override
    public VehicleResponse unassignDriver(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
        vehicle.setCurrentDriverId(null);
        return mapToResponse(vehicleRepository.save(vehicle));
    }

    private VehicleResponse mapToResponse(Vehicle vehicle) {
        return VehicleResponse.builder()
                .id(vehicle.getId())
                .plateNumber(vehicle.getPlateNumber())
                .type(vehicle.getType())
                .brand(vehicle.getBrand())
                .model(vehicle.getModel())
                .maxWeightKg(vehicle.getMaxWeightKg())
                .volumeM3(vehicle.getVolumeM3())
                .status(vehicle.getStatus())
                .currentDriverId(vehicle.getCurrentDriverId())
                .yearOfManufacture(vehicle.getYearOfManufacture())
                .createdAt(vehicle.getCreatedAt())
                .build();
    }
}
