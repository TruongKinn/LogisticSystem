# Logistics Microservice System (LogisticSystem)

Dự án **LogisticSystem** được xây dựng dựa trên kiến trúc Microservices chuyên biệt cho quản lý vận tải, điều phối tài xế và theo dõi hành trình thời gian thực. Hệ thống tuân thủ các tiêu chuẩn phát triển của dự án mẫu `vn.agent`.

## 1. Tech Stack & Infrastructure

- **Language**: Java 17 (Eclipse Temurin)
- **Framework**: Spring Boot 3.3.3
- **Build Tool**: Maven
- **Containerization**: Docker, Docker Compose
- **Databases**: 
  - **PostgreSQL 15**: Lưu trữ dữ liệu quan hệ (Shipment, Driver, Vehicle, Notification).
  - **MongoDB 6**: Lưu trữ dữ liệu phi cấu trúc và log hành trình (Tracking events).
  - **Redis 6**: Rate limiting và caching tại Gateway.
- **Messaging**: Apache Kafka + Zookeeper (Event-Driven Architecture).
- **Monitoring**: Prometheus & Grafana.
- **API Documentation**: OpenAPI (SpringDoc) 2.2.0.

## 2. Microservices Architecture

| Service Name | Port | Database | Description |
| :--- | :--- | :--- | :--- |
| **api-gateway** | 4953 | Redis | Central entry point, Routing, Rate Limiting & Swagger Aggregation. |
| **logistics-service** | 8093 | N/A | Orchestrator - Điều phối luồng nghiệp vụ giữa các service. |
| **shipment-service** | 8094 | PostgreSQL | Quản lý vận đơn, trạng thái giao hàng và lộ trình. |
| **tracking-service** | 8095 | MongoDB | Theo dõi lịch sử hành trình thời gian thực từ Kafka Events. |
| **driver-service** | 8096 | PostgreSQL | Quản lý thông tin tài xế, bằng lái và trạng thái hoạt động. |
| **vehicle-service** | 8097 | PostgreSQL | Quản lý đội xe, tải trọng, thể tích và gán tài xế. |
| **notification-service**| 8098 | PostgreSQL | Xử lý gửi thông báo (Email/SMS) dựa trên sự kiện hệ thống. |
| **frontend** | 80 | N/A | Angular 17 Management Dashboard. |

## 3. Service Standard Structure

Mỗi service trong hệ thống tuân thủ cấu trúc chuẩn:

```text
vn.logistic.[service]
├── [Service]Application.java  # Main Application
├── common                     # Enum, Constants, Shared DTOs
├── config                     # Kafka, JPA, Web configurations
├── controller                 # REST Endpoints (mapped to /v3/api-docs)
├── model                      # JPA Entities or Mongo Documents
├── repository                 # Spring Data Interfaces
└── service                    # Business Logic (Interface & Impl)
```

## 4. Development Workflow & Rules

### 4.1. Naming Conventions
- **Group ID**: `vn.logistic`
- **Artifact ID**: `[name]-service`
- **Package Base**: `vn.logistic.[servicename]`
- **Controllers**: `[Entity]Controller` với `@Tag` cho Swagger.

### 4.2. Docker & CI/CD
Mỗi service bao gồm:
- **Dockerfile**: Sử dụng `eclipse-temurin:17-jdk-alpine`.
- **Jenkinsfile**: Pipeline chuẩn bao gồm các bước Build (Maven) và Dockerize.

### 4.3. Kafka Events
Hệ thống sử dụng các topic chính:
- `logistics.shipment.created`: Khi có vận đơn mới.
- `logistics.shipment.status.updated`: Khi cập nhật trạng thái giao hàng (Kích hoạt Tracking/Notification).
- `logistics.driver.assigned`: Khi tài xế được gán cho xe/vận đơn.

## 5. How to Run

### 1. Build Backend
Chạy tạ mỗi thư mục service:
```bash
mvn clean package -DskipTests
```

### 2. Build Frontend
```bash
cd frontend && npm install && npm run build --prod
```

### 3. Deploy with Docker Compose
```bash
docker-compose up -d --build
```

### 4. Access Points
- **Swagger UI**: `http://localhost:4953/swagger-ui.html`
- **Dashboard**: `http://localhost`
- **Prometheus**: `http://localhost:9090`
