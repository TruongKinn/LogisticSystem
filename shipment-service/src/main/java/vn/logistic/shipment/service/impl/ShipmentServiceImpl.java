package vn.logistic.shipment.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import vn.logistic.shipment.common.ShipmentStatus;
import vn.logistic.shipment.controller.request.CreateShipmentRequest;
import vn.logistic.shipment.controller.request.UpdateStatusRequest;
import vn.logistic.shipment.controller.response.ShipmentResponse;
import vn.logistic.shipment.event.producer.ShipmentEventProducer;
import vn.logistic.shipment.model.Shipment;
import vn.logistic.shipment.repository.ShipmentRepository;
import vn.logistic.shipment.service.ShipmentService;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
                .orElseThrow(() -> new RuntimeException("Shipment not found"));
    }

    @Override
    public ShipmentResponse getShipmentByCode(String code) {
        return shipmentRepository.findByShipmentCode(code)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Shipment not found by code"));
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
        
        // Publish Event
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
                .orElseThrow(() -> new RuntimeException("Shipment not found"));
                
        shipment.setStatus(request.getStatus());
        if(request.getNote() != null && !request.getNote().isEmpty()) {
            shipment.setNote(request.getNote());
        }
        
        if (request.getStatus() == ShipmentStatus.DELIVERED) {
            shipment.setDeliveredAt(new Date());
        }
        
        Shipment updated = shipmentRepository.save(shipment);
        
        // Publish Event
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
                .orElseThrow(() -> new RuntimeException("Shipment not found"));
                
        shipment.setDriverId(driverId);
        shipment.setVehicleId(vehicleId);
        shipment.setStatus(ShipmentStatus.ASSIGNED);
        
        Shipment updated = shipmentRepository.save(shipment);
        
        // Publish Event
        Map<String, Object> event = new HashMap<>();
        event.put("shipmentId", updated.getId());
        event.put("shipmentCode", updated.getShipmentCode());
        event.put("driverId", driverId);
        event.put("vehicleId", vehicleId);
        
        eventProducer.publishDriverAssignedEvent(event);
        
        return mapToResponse(updated);
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
