# Logistic System — Kafka Events Directory

This document outlines the standard Apache Kafka topics used across the system for asynchronous event-driven communication.

## Topics

### 1. `logistics.shipment.created`
- **Producer:** `shipment-service`
- **Consumers:** `notification-service`
- **Trigger:** When a new shipment is successfully created in the system.
- **Payload:**
```json
{
  "shipmentId": 123,
  "shipmentCode": "SHP-20260328-0001",
  "senderName": "Nguyen Van A",
  "receiverName": "Tran Thi B",
  "createdAt": "2026-03-28T10:00:00Z"
}
```

### 2. `logistics.shipment.status.updated`
- **Producer:** `shipment-service`
- **Consumers:** `tracking-service`, `notification-service`
- **Trigger:** Whenever a shipment changes its state (e.g. `PENDING` -> `ASSIGNED`, or `IN_TRANSIT` -> `DELIVERED`).
- **Payload:**
```json
{
  "shipmentId": 123,
  "shipmentCode": "SHP-20260328-0001",
  "status": "IN_TRANSIT",
  "location": "Hà Nội",
  "note": "Package has left the facility",
  "updatedBy": "admin",
  "timestamp": "2026-03-28T14:30:00Z"
}
```

### 3. `logistics.driver.assigned`
- **Producer:** `shipment-service`
- **Consumers:** `notification-service`
- **Trigger:** When a driver is assigned to a shipment/vehicle route.
- **Payload:**
```json
{
  "shipmentId": 123,
  "shipmentCode": "SHP-20260328-0001",
  "driverId": 45,
  "driverName": "Nguyen Van Tai",
  "vehicleId": 12
}
```
