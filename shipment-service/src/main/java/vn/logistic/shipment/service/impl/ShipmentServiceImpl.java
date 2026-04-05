package vn.logistic.shipment.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.stereotype.Service;
import vn.logistic.shipment.common.ShipmentStatus;
import vn.logistic.shipment.controller.request.CreateShipmentRequest;
import vn.logistic.shipment.controller.request.UpdateStatusRequest;
import vn.logistic.shipment.controller.response.ShipmentResponse;
import vn.logistic.shipment.event.dto.DriverAssignedEvent;
import vn.logistic.shipment.event.dto.DriverAssignedPayload;
import vn.logistic.shipment.event.producer.ShipmentEventProducer;
import vn.logistic.shipment.exception.BusinessConflictException;
import vn.logistic.shipment.exception.ResourceNotFoundException;
import vn.logistic.shipment.model.Shipment;
import vn.logistic.shipment.repository.ShipmentRepository;
import vn.logistic.shipment.service.ShipmentService;

import java.text.SimpleDateFormat;
import java.time.Instant;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class ShipmentServiceImpl implements ShipmentService {

    private final ShipmentRepository shipmentRepository;
    private final ShipmentEventProducer eventProducer;

    @Override
    public List<ShipmentResponse> getAllShipments() {
        return shipmentRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ShipmentResponse getShipmentById(Long id) {
        return shipmentRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found: " + id));
    }

    @Override
    public ShipmentResponse getShipmentByCode(String code) {
        return shipmentRepository.findByShipmentCode(code)
                .map(this::mapToResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found by code: " + code));
    }

    @Override
    public List<ShipmentResponse> getShipmentsByOrderRef(String orderRef) {
        return shipmentRepository.findByOrderRef(orderRef).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ShipmentResponse> getShipmentsByStatus(ShipmentStatus status) {
        return shipmentRepository.findByStatus(status).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ShipmentResponse> getShipmentsByDriver(Long driverId) {
        return shipmentRepository.findByDriverId(driverId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ShipmentResponse createShipment(CreateShipmentRequest request) {
        String generatedCode = "SHP-" + new SimpleDateFormat("yyyyMMdd").format(new Date()) + "-" + System.currentTimeMillis() % 10000;

        Shipment shipment = Shipment.builder()
                .shipmentCode(generatedCode)
                .orderRef(request.getOrderRef())
                .status(ShipmentStatus.PENDING)
                .senderName(request.getSenderName())
                .senderPhone(request.getSenderPhone())
                .senderAddress(request.getSenderAddress())
                .receiverName(request.getReceiverName())
                .receiverPhone(request.getReceiverPhone())
                .receiverAddress(request.getReceiverAddress())
                .weightKg(request.getWeightKg())
                .codAmount(request.getCodAmount())
                .note(request.getNote())
                .build();

        Shipment savedShipment = shipmentRepository.save(shipment);

        Map<String, Object> event = new HashMap<>();
        event.put("shipmentId", savedShipment.getId());
        event.put("shipmentCode", savedShipment.getShipmentCode());
        event.put("senderName", savedShipment.getSenderName());
        event.put("receiverName", savedShipment.getReceiverName());
        event.put("createdAt", savedShipment.getCreatedAt());

        eventProducer.publishShipmentCreatedEvent(event);

        return mapToResponse(savedShipment);
    }

    @Override
    public ShipmentResponse updateStatus(Long id, UpdateStatusRequest request) {
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found: " + id));

        shipment.setStatus(request.getStatus());
        if (request.getNote() != null && !request.getNote().isEmpty()) {
            shipment.setNote(request.getNote());
        }

        if (request.getStatus() == ShipmentStatus.DELIVERED) {
            shipment.setDeliveredAt(new Date());
        }

        Shipment updated = shipmentRepository.save(shipment);

        Map<String, Object> event = new HashMap<>();
        event.put("shipmentId", updated.getId());
        event.put("shipmentCode", updated.getShipmentCode());
        event.put("status", updated.getStatus().name());
        event.put("note", updated.getNote());
        event.put("timestamp", new Date());

        eventProducer.publishStatusUpdatedEvent(event);

        return mapToResponse(updated);
    }

    @Override
    public ShipmentResponse assignDriverAndVehicle(Long id, Long driverId, Long vehicleId) {
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found: " + id));

        if (shipment.getStatus() != ShipmentStatus.PENDING) {
            throw new BusinessConflictException(
                    "Shipment " + shipment.getShipmentCode() + " is in status " + shipment.getStatus() + " and cannot be assigned");
        }

        shipment.setDriverId(driverId);
        shipment.setVehicleId(vehicleId);
        shipment.setStatus(ShipmentStatus.ASSIGNED);

        Shipment updated = shipmentRepository.save(shipment);

        String eventId = UUID.randomUUID().toString();
        DriverAssignedEvent event = DriverAssignedEvent.builder()
                .eventId(eventId)
                .eventType("logistics.driver.assigned")
                .eventVersion(1)
                .occurredAt(Instant.now())
                .producer("shipment-service")
                .traceId(MDC.get("traceId") != null ? MDC.get("traceId") : eventId)
                .payload(DriverAssignedPayload.builder()
                        .shipmentId(updated.getId())
                        .shipmentCode(updated.getShipmentCode())
                        .driverId(driverId)
                        .vehicleId(vehicleId)
                        .build())
                .build();

        eventProducer.publishDriverAssignedEvent(event);

        return mapToResponse(updated);
    }

    @Override
    public ShipmentResponse unassignDriverAndVehicle(Long id) {
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found: " + id));

        shipment.setDriverId(null);
        shipment.setVehicleId(null);
        shipment.setStatus(ShipmentStatus.PENDING);

        return mapToResponse(shipmentRepository.save(shipment));
    }

    private ShipmentResponse mapToResponse(Shipment shipment) {
        return ShipmentResponse.builder()
                .id(shipment.getId())
                .shipmentCode(shipment.getShipmentCode())
                .orderRef(shipment.getOrderRef())
                .driverId(shipment.getDriverId())
                .vehicleId(shipment.getVehicleId())
                .status(shipment.getStatus())
                .senderName(shipment.getSenderName())
                .senderPhone(shipment.getSenderPhone())
                .senderAddress(shipment.getSenderAddress())
                .receiverName(shipment.getReceiverName())
                .receiverPhone(shipment.getReceiverPhone())
                .receiverAddress(shipment.getReceiverAddress())
                .weightKg(shipment.getWeightKg())
                .codAmount(shipment.getCodAmount())
                .note(shipment.getNote())
                .estimatedAt(shipment.getEstimatedAt())
                .deliveredAt(shipment.getDeliveredAt())
                .createdAt(shipment.getCreatedAt())
                .build();
    }
}
