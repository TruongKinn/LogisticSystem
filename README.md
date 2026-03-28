# Logistics Microservice System

Dự án Logistics System được thiết kế theo kiến trúc **Microservices, Event-Driven Architecture (EDA)** nhằm quản lý vận đơn, tài xế, phương tiện và lịch sử hành trình.

## 🚀 Tính năng & Thành phần (Architecture)

Hệ thống bao gồm **7 Microservices (Backend)** và **1 Frontend Application**:

1. **`api-gateway` (Port: 4953)**: Điểm vào duy nhất (Entrypoint) cho Frontend, định tuyến qua Spring Cloud Gateway và rate limiting bằng Redis. Tổng hợp Swagger UI của tất cả service.
2. **`logistics-service` (Port: 8093)**: Đóng vai trò là _Orchestrator_. Cung cấp endpoint tổng hợp (ví dụ: gán tài xế, phương tiện vào vận đơn) thông qua việc tái sử dụng `OpenFeign` gọi sang các service khác.
3. **`shipment-service` (Port: 8094)**: Quản lý vòng đời vận đơn. Produce các Event (`logistics.shipment.created`, v.v.) lên Kafka. Sử dụng cấu hình PostgreSQL.
4. **`driver-service` (Port: 8096)**: Quản lý thông tin tài xế và trạng thái hoạt động (AVAILABLE, BUSY,...). Lõi là PostgreSQL.
5. **`vehicle-service` (Port: 8097)**: Quản lý các phương tiện giao hàng, thể tích, trọng lượng tối đa. Lõi là PostgreSQL.
6. **`tracking-service` (Port: 8095)**: Lắng nghe Kafka Consumer (Event khi Shipment thay đổi trạng thái). Lưu trữ lịch sử di chuyển tốc độ cao, sử dụng MongoDB.
7. **`notification-service` (Port: 8098)**: Lắng nghe Kafka Consumer để gửi Email/SMS tự động đến khách hàng hoặc Driver.
8. **`frontend` (Port: 80)**: Giao diện Management Dashboard được xây dựng bằng Angular 17.

## 🛠 Nền tảng Công nghệ (Tech Stack)

- **Backend Framework**: Java 17, Spring Boot 3.3.3, Spring Data JPA, MongoDB, Spring Cloud OpenFeign
- **Frontend**: Angular 17, SCSS
- **Message Broker**: Apache Kafka, Zookeeper
- **Databases**: PostgreSQL 15, MongoDB 6, Redis 6
- **Monitoring**: Prometheus, Grafana
- **DevOps**: Docker, Docker Compose, Jenkins CI

## 📋 Hướng dẫn Khởi chạy (Get Started)

### 1. Build các Service (Backend + Frontend)

Bạn cần mở terminal ở từng thư mục ứng dụng Spring Boot và chạy Maven (Yêu cầu cài sẵn JDK 17 và Maven):
```bash
# Ví dụ build API Gateway
cd api-gateway
mvn clean package -DskipTests
```
Lặp lại thao tác này cho các folder: `logistics-service`, `shipment-service`, `driver-service`, `vehicle-service`, `tracking-service`, `notification-service`.

Đối với Frontend (Yêu cầu Node.js >= 18):
```bash
cd frontend
npm install
npm run build --prod
```

### 2. Khởi chạy toàn bộ bằng Docker Compose

Dự án đã định nghĩa sẵn file `docker-compose.yml` gồm toàn bộ **Infrastructure (Redis, Postgres, Mongo, Kafka, Zookeeper, Prometheus, Grafana)** cùng **7 Services** và Frontend trên cùng mạng lưới network:

```bash
docker-compose up -d --build
```

### 3. Thông tin Truy cập

- **API Gateway Swagger**: `http://localhost:4953/webjars/swagger-ui/index.html` (chứa tài liệu gom của 5 services con).
- **Trang Dashboard Admin (Angular)**: `http://localhost` (Port 80)
- **Monitoring - Grafana**: `http://localhost:3000` (Tài khoản mặc định thường là `admin` / `password`)

## 📌 Các bước tiếp theo

1. Kết nối giao diện Angular với các bộ API (CRUD vận đơn, tài xế, phương tiện).
2. Tích hợp JWT Authentication cho API Gateway (Keycloak / OAuth2).
3. Triển khai phân phối log tập trung (ELK Stack).
