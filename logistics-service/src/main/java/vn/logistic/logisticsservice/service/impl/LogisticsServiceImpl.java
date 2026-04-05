package vn.logistic.logisticsservice.service.impl;

import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import vn.logistic.logisticsservice.client.DriverClient;
import vn.logistic.logisticsservice.client.ShipmentClient;
import vn.logistic.logisticsservice.client.VehicleClient;
import vn.logistic.logisticsservice.dto.DriverDto;
import vn.logistic.logisticsservice.dto.OrchestratorResponse;
import vn.logistic.logisticsservice.dto.SagaTransactionResponse;
import vn.logistic.logisticsservice.dto.ShipmentDto;
import vn.logistic.logisticsservice.dto.VehicleDto;
import vn.logistic.logisticsservice.exception.BusinessConflictException;
import vn.logistic.logisticsservice.exception.DownstreamServiceException;
import vn.logistic.logisticsservice.exception.ResourceNotFoundException;
import vn.logistic.logisticsservice.service.LogisticsService;

import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class LogisticsServiceImpl implements LogisticsService {

    private static final String DRIVER_BUSY = "BUSY";
    private static final String DRIVER_AVAILABLE = "AVAILABLE";
    private static final String VEHICLE_IN_USE = "IN_USE";
    private static final String VEHICLE_AVAILABLE = "AVAILABLE";
    private static final String SHIPMENT_PENDING = "PENDING";

    private final ShipmentClient shipmentClient;
    private final DriverClient driverClient;
    private final VehicleClient vehicleClient;

    @Override
    public OrchestratorResponse assignDelivery(String shipmentCode, Long driverId, Long vehicleId) {
        log.info("Process assign delivery: shipment={}, driver={}, vehicle={}", shipmentCode, driverId, vehicleId);

        ShipmentDto shipment = fetchShipment(shipmentCode);
        validateShipmentCanBeAssigned(shipment);

        DriverDto driver = fetchDriver(driverId);
        validateDriverIsAvailable(driver);

        VehicleDto vehicle = fetchVehicle(vehicleId);
        validateVehicleIsAvailable(vehicle);

        DriverDto updatedDriver = null;
        boolean vehicleStatusUpdated = false;
        boolean vehicleDriverAssigned = false;

        try {
            updatedDriver = updateDriverStatus(driverId, DRIVER_BUSY);
            updateVehicleStatus(vehicleId, VEHICLE_IN_USE);
            vehicleStatusUpdated = true;

            VehicleDto updatedVehicle = assignDriverToVehicle(vehicleId, driverId);
            vehicleDriverAssigned = true;

            ShipmentDto updatedShipment = assignShipment(shipment.getId(), driverId, vehicleId);

            return OrchestratorResponse.builder()
                    .shipment(updatedShipment)
                    .driver(updatedDriver)
                    .vehicle(updatedVehicle)
                    .build();
        } catch (RuntimeException exception) {
            compensateAssignment(driverId, vehicleId, updatedDriver != null, vehicleStatusUpdated, vehicleDriverAssigned);
            throw exception;
        }
    }

    @Override
    public OrchestratorResponse getFullDeliveryInfo(String shipmentCode) {
        ShipmentDto shipment = fetchShipment(shipmentCode);

        DriverDto driver = null;
        if (shipment.getDriverId() != null) {
            driver = fetchDriver(shipment.getDriverId());
        }

        VehicleDto vehicle = null;
        if (shipment.getVehicleId() != null) {
            vehicle = fetchVehicle(shipment.getVehicleId());
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
                .orElseThrow(() -> new ResourceNotFoundException("Saga transaction not found: " + id));
    }

    private ShipmentDto fetchShipment(String shipmentCode) {
        try {
            return shipmentClient.getShipmentByCode(shipmentCode);
        } catch (FeignException.NotFound exception) {
            throw new ResourceNotFoundException("Shipment not found by code: " + shipmentCode);
        } catch (FeignException exception) {
            throw new DownstreamServiceException("Unable to fetch shipment from shipment-service");
        }
    }

    private DriverDto fetchDriver(Long driverId) {
        try {
            return driverClient.getDriverById(driverId);
        } catch (FeignException.NotFound exception) {
            throw new ResourceNotFoundException("Driver not found: " + driverId);
        } catch (FeignException exception) {
            throw new DownstreamServiceException("Unable to fetch driver from driver-service");
        }
    }

    private VehicleDto fetchVehicle(Long vehicleId) {
        try {
            return vehicleClient.getVehicleById(vehicleId);
        } catch (FeignException.NotFound exception) {
            throw new ResourceNotFoundException("Vehicle not found: " + vehicleId);
        } catch (FeignException exception) {
            throw new DownstreamServiceException("Unable to fetch vehicle from vehicle-service");
        }
    }

    private ShipmentDto assignShipment(Long shipmentId, Long driverId, Long vehicleId) {
        try {
            return shipmentClient.assignDriverAndVehicle(shipmentId, driverId, vehicleId);
        } catch (FeignException.NotFound exception) {
            throw new ResourceNotFoundException("Shipment not found: " + shipmentId);
        } catch (FeignException.Conflict exception) {
            throw new BusinessConflictException("Shipment can no longer be assigned");
        } catch (FeignException exception) {
            throw new DownstreamServiceException("Unable to assign shipment in shipment-service");
        }
    }

    private DriverDto updateDriverStatus(Long driverId, String status) {
        try {
            return driverClient.updateDriverStatus(driverId, status);
        } catch (FeignException.NotFound exception) {
            throw new ResourceNotFoundException("Driver not found: " + driverId);
        } catch (FeignException.Conflict exception) {
            throw new BusinessConflictException("Driver is not available for assignment");
        } catch (FeignException exception) {
            throw new DownstreamServiceException("Unable to update driver status in driver-service");
        }
    }

    private void updateVehicleStatus(Long vehicleId, String status) {
        try {
            vehicleClient.updateVehicleStatus(vehicleId, status);
        } catch (FeignException.NotFound exception) {
            throw new ResourceNotFoundException("Vehicle not found: " + vehicleId);
        } catch (FeignException.Conflict exception) {
            throw new BusinessConflictException("Vehicle is not available for assignment");
        } catch (FeignException exception) {
            throw new DownstreamServiceException("Unable to update vehicle status in vehicle-service");
        }
    }

    private VehicleDto assignDriverToVehicle(Long vehicleId, Long driverId) {
        try {
            return vehicleClient.assignDriver(vehicleId, driverId);
        } catch (FeignException.NotFound exception) {
            throw new ResourceNotFoundException("Vehicle not found: " + vehicleId);
        } catch (FeignException.Conflict exception) {
            throw new BusinessConflictException("Vehicle already has another driver assigned");
        } catch (FeignException exception) {
            throw new DownstreamServiceException("Unable to assign driver to vehicle in vehicle-service");
        }
    }

    private void validateShipmentCanBeAssigned(ShipmentDto shipment) {
        if (!SHIPMENT_PENDING.equals(shipment.getStatus())) {
            throw new BusinessConflictException(
                    "Shipment " + shipment.getShipmentCode() + " is in status " + shipment.getStatus() + " and cannot be assigned");
        }
    }

    private void validateDriverIsAvailable(DriverDto driver) {
        if (!DRIVER_AVAILABLE.equals(driver.getStatus())) {
            throw new BusinessConflictException("Driver " + driver.getId() + " is in status " + driver.getStatus());
        }
    }

    private void validateVehicleIsAvailable(VehicleDto vehicle) {
        if (!VEHICLE_AVAILABLE.equals(vehicle.getStatus())) {
            throw new BusinessConflictException("Vehicle " + vehicle.getId() + " is in status " + vehicle.getStatus());
        }
        if (vehicle.getCurrentDriverId() != null) {
            throw new BusinessConflictException("Vehicle " + vehicle.getId() + " already has driver " + vehicle.getCurrentDriverId());
        }
    }

    private void compensateAssignment(Long driverId, Long vehicleId, boolean driverBusy, boolean vehicleStatusUpdated,
                                      boolean vehicleDriverAssigned) {
        if (vehicleDriverAssigned) {
            try {
                vehicleClient.unassignDriver(vehicleId);
            } catch (Exception exception) {
                log.error("Failed to compensate vehicle driver assignment for vehicle={}", vehicleId, exception);
            }
        }

        if (vehicleStatusUpdated) {
            try {
                vehicleClient.updateVehicleStatus(vehicleId, VEHICLE_AVAILABLE);
            } catch (Exception exception) {
                log.error("Failed to compensate vehicle status for vehicle={}", vehicleId, exception);
            }
        }

        if (driverBusy) {
            try {
                driverClient.updateDriverStatus(driverId, DRIVER_AVAILABLE);
            } catch (Exception exception) {
                log.error("Failed to compensate driver status for driver={}", driverId, exception);
            }
        }
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
