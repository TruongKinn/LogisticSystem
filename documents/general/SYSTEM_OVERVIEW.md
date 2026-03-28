# Logistic System — Overview

## Architecture Diagram

```mermaid
graph TD
    FE[Angular Frontend :80] --> GW[API Gateway :4953]

    GW --> LS[logistics-service :8093]
    GW --> SS[shipment-service :8094]
    GW --> TS[tracking-service :8095]
    GW --> DS[driver-service :8096]
    GW --> VS[vehicle-service :8097]
    GW --> NS[notification-service :8098]

    SS -- Kafka: shipment.created --> NS
    SS -- Kafka: shipment.status_updated --> TS
    SS -- Kafka: shipment.status_updated --> NS
    SS -- Feign --> DS
    SS -- Feign --> VS

    LS -- REST --> SS
    LS -- REST --> DS
    LS -- REST --> VS

    SS --> PG1[(PostgreSQL\nshipment_db)]
    DS --> PG2[(PostgreSQL\ndriver_db)]
    VS --> PG3[(PostgreSQL\nvehicle_db)]
    NS --> PG4[(PostgreSQL\nnotification_db)]
    TS --> MG[(MongoDB\ntracking_db)]
    GW --> RD[(Redis\nRate Limit)]
```

## Service Details

| Service | Port | Database | Role |
|---------|------|----------|------|
| `api-gateway` | 4953 | Redis | Gateway entrypoint for external HTTP requests |
| `logistics-service` | 8093 | N/A | Orchestrator unifying multiple services |
| `shipment-service` | 8094 | PostgreSQL (`shipment_db`) | Core shipment management and routing |
| `tracking-service` | 8095 | MongoDB (`tracking_db`) | Shipment event tracking and real-time history |
| `driver-service` | 8096 | PostgreSQL (`driver_db`) | Driver CRUD and assignments |
| `vehicle-service` | 8097 | PostgreSQL (`vehicle_db`) | Vehicle and fleet management |
| `notification-service`| 8098 | PostgreSQL (`notification_db`) | Asynchronous notification sender (Email, SMS) |
