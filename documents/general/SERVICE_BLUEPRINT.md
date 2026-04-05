# Microservice Service Blueprint

## 1. Muc tieu

File nay la blueprint ky thuat cho **moi service** trong `LogisticSystem`.
Neu `ARCHITECTURE_STANDARD.md` tra loi cau hoi "service nao duoc phep tuong tac voi service nao", thi file nay tra loi cau hoi "mot service chuan best practices phai duoc xay nhu the nao".

Moi service moi, va moi service cu khi refactor, phai follow blueprint nay.

## 2. Dinh nghia mot service "dat chuan"

Mot service dat chuan trong he thong nay phai dam bao dong thoi:

- Co bounded context ro rang.
- Co ownership du lieu rieng.
- Co API contract typed, versioned, backward-compatible.
- Co event contract typed, versioned, idempotent.
- Co resilience cho network va dependency failure.
- Co observability day du de van hanh.
- Co test o dung cap do.
- Co Docker/CI/CD/deploy readiness.
- Co security baseline va config ngoai code.

Neu thieu mot trong cac nhom tren, service chua duoc xem la best-practice service.

## 3. Golden Rules

### 3.1. Don mot bounded context

Mot service chi giai quyet **mot** domain chinh. Khong tao service "god-service".

Dung:

- `shipment-service` chi quan ly shipment aggregate va shipment state transition.
- `driver-service` chi quan ly driver master data va availability.

Khong dung:

- Vua CRUD shipment, vua gui notification, vua ghi tracking, vua tinh dashboard trong cung service.

### 3.2. Don mot source of truth

Service nao so huu domain nao thi service do la source of truth cua domain do.

Vi du:

- `shipment-service` la source of truth cho `shipment.status`.
- `tracking-service` chi la read model tu event, khong duoc coi la nguon dung de cap nhat shipment.

### 3.3. Don mot cach giao tiep co kiem soat

Moi interaction giua services phai thuoc **mot trong hai loai**:

- sync contract: REST/gRPC typed
- async contract: Kafka event typed

Khong chap nhan:

- dung chung database
- goi SQL qua schema cua service khac
- chia se entity class qua module chung roi cung thao tac du lieu
- truyen payload JSON khong co schema ro rang trong thoi gian dai

## 4. Cau truc thu muc bat buoc

```text
src/main/java/vn/logistic/<service>/
├── <Service>Application.java
├── common/
├── config/
├── controller/
├── controller/request/
├── controller/response/
├── dto/
├── model/
├── repository/
├── service/
├── service/impl/
├── client/
├── event/
│   ├── producer/
│   ├── consumer/
│   └── dto/
├── exception/
├── mapper/
└── util/
```

Them cac thu muc sau khi can:

- `security/`: auth filter, permission evaluator, token bridge
- `scheduler/`: job dinh ky
- `migration/`: flyway/liquibase scripts
- `integration/`: adapter den he thong ngoai

Quy tac folder:

- `controller/` chi xu ly HTTP mapping, validation co ban, response code.
- `service/` chua use-case va domain orchestration trong pham vi service.
- `repository/` khong chua business logic.
- `client/` la noi duy nhat duoc phep chua logic goi service khac.
- `event/` tach rieng producer, consumer, DTO.
- `exception/` chua domain exception va `GlobalExceptionHandler`.

## 5. Layering Rule

Dependency duoc phep:

- `controller -> service`
- `service -> repository`
- `service -> client`
- `service -> event.producer`
- `event.consumer -> service`
- `service -> mapper`

Dependency khong duoc phep:

- `controller -> repository`
- `controller -> client`
- `repository -> service`
- `event.consumer -> repository` neu bo qua service layer
- `service A impl` truy cap truc tiep class noi bo cua `service B`

## 6. API Design Best Practices

### 6.1. URI va versioning

Tat ca public endpoint moi phai theo mau:

`/api/v1/<resource>`

Qua gateway, endpoint public se thanh:

`/<service>/api/v1/<resource>`

Vi du:

- `/shipment/api/v1/shipments`
- `/driver/api/v1/drivers/{id}`
- `/tracking/api/v1/shipments/{shipmentCode}/events`

### 6.2. Request/Response typed

- Khong dung entity JPA lam request body.
- Khong tra entity thang ra API.
- Request/response phai dung DTO rieng.
- DTO phai co ten ro nghia: `CreateShipmentRequest`, `ShipmentResponse`, `ShipmentSummaryResponse`.

### 6.3. Error contract thong nhat

Tat ca service phai tra loi theo schema thong nhat:

```json
{
  "timestamp": "2026-03-31T10:00:00Z",
  "status": 400,
  "code": "VALIDATION_ERROR",
  "message": "Receiver address must not be blank",
  "path": "/shipment/api/v1/shipments",
  "traceId": "01HT..."
}
```

Bat buoc:

- Co `code` theo machine-readable format.
- Co `traceId`.
- Khong tra stacktrace ra ngoai.

### 6.4. Pagination va filtering

Danh sach lon phai co:

- `page`
- `size`
- `sort`
- filter ro rang

Khong tra full table cho endpoint list production.

### 6.5. Idempotency

Cho cac write API quan trong can xem xet:

- `Idempotency-Key`
- unique business key
- duplicate request detection

Rat quan trong voi create order, create shipment, payment, resend notification.

## 7. Domain va Data Best Practices

### 7.1. Database per service

Moi service co database/schema/collection rieng.

Cam:

- join cross-database de lam business logic online
- flyway script tac dong schema cua service khac
- repository cua service nay doc bang cua service kia

### 7.2. Migration co kiem soat

Moi service phai dung Flyway hoac Liquibase.

Khong nen dua vao `ddl-auto=update` o production.

Khuyen nghi:

- `dev`: co the linh hoat hon
- `test/prod`: migration versioned, review duoc, rollback strategy ro rang

### 7.3. Auditing

Entity quan trong nen co:

- `createdAt`
- `createdBy`
- `updatedAt`
- `updatedBy`
- `version` cho optimistic locking neu can

### 7.4. Soft delete

Chi dung soft delete neu domain thuc su can.
Neu da dung, phai co convention thong nhat va index phu hop.

## 8. Integration va Event Best Practices

### 8.1. REST/gRPC client

Moi client can co:

- timeout ro rang
- retry co dieu kien
- circuit breaker neu dependency critical
- fallback chi khi that su hop ly
- log request/response toi thieu o muc debug/info phu hop

Khong duoc:

- goi service khac bang hard-coded URL trong service impl
- bo mac timeout default

### 8.2. Event schema

Moi event phai co envelope:

```json
{
  "eventId": "uuid",
  "eventType": "logistics.shipment.created",
  "eventVersion": 1,
  "occurredAt": "2026-03-31T10:00:00Z",
  "producer": "shipment-service",
  "traceId": "trace-id",
  "payload": {}
}
```

Khong dung `Map<String, Object>` lam contract chinh thuc.

### 8.3. Consumer idempotency

Consumer phai an toan khi nhan lai event.

Can uu tien:

- dedup bang `eventId`
- unique constraint neu can
- upsert thay vi insert mu

### 8.4. Outbox Pattern

Voi event quan trong, target best practice la:

- ghi du lieu business
- ghi outbox cung transaction
- worker publish tu outbox sang Kafka

Dieu nay tranh mat event khi DB commit thanh cong nhung Kafka publish that bai.

### 8.5. Retry va Dead Letter

Kafka consumer can co chien luoc:

- retry co gioi han
- logging day du
- dead-letter topic cho event khong xu ly duoc

## 9. Resilience Best Practices

Moi service co dependency network phai co:

- connect timeout
- read timeout
- retry co backoff
- circuit breaker
- bulkhead neu tai cao

Khong retry vo han.
Khong retry blind cho request khong idempotent.

Use-case orchestration phai xac dinh ro:

- thao tac nao la critical
- thao tac nao la side effect
- thao tac nao can compensate

## 10. Security Best Practices

### 10.1. Authentication va authorization

- Gateway xu ly auth o edge layer theo policy.
- Service van phai verify trust boundary neu la endpoint nhay cam.
- Role/permission check phai tap trung, khong copy logic authorize thu cong moi noi.

### 10.2. Secret management

Khong hard-code:

- JWT key
- DB password
- mail password
- API token

Phai doc tu:

- environment variable
- Vault
- secret manager cua platform

### 10.3. Input hardening

- Validate request DTO.
- Sanitize input khi can.
- Gioi han payload size.
- Bao ve endpoint upload/file processing.

## 11. Observability Best Practices

Moi service phai co:

- health endpoint
- readiness/liveness probe
- metrics request count / latency / error rate
- structured logs
- trace propagation qua header

Log toi thieu phai co:

- `traceId`
- `service`
- `operation`
- `entityId` neu co
- `eventId` neu la event

Khong log:

- password
- access token
- refresh token
- PII nhay cam neu khong can thiet

## 12. Configuration Best Practices

Config phai tach theo moi truong:

- `application.yml`
- `application-dev.yml`
- `application-test.yml`
- `application-prod.yml`

Quy tac:

- `application.yml` chua default an toan.
- Moi profile override phan can thiet.
- Khong de config production quan trong chi ton tai trong local file khong duoc version control.

## 13. Testing Pyramid Cho Tung Service

Moi service dat chuan phai co:

- unit test cho business rule
- integration test cho repository va controller critical
- contract test cho client/event
- e2e test cho flow quan trong neu service nam trong business critical path

Bat buoc test cho:

- happy path
- validation failure
- not found
- conflict / duplicate
- dependency timeout/failure
- idempotency neu co

## 14. CI/CD va Release Best Practices

Moi service phai co:

- Dockerfile nho, reproducible
- Jenkinsfile/GitHub Actions co build + test + package
- image tag theo version/commit SHA
- rollback strategy
- health check sau deploy

Khong nen:

- deploy image `latest` lam nguon su that duy nhat
- skip test toan bo ma khong co ly do

## 15. Definition of Done Cho Mot Service Moi

Mot service moi chi duoc xem la "done" khi dat du cac muc sau:

1. Co README/service doc mo ta bounded context va API.
2. Co package structure dung blueprint.
3. Co migration script.
4. Co DTO request/response typed.
5. Co `GlobalExceptionHandler`.
6. Co health endpoint va metrics.
7. Co timeout/retry cho moi external client.
8. Co event schema typed neu publish/consume Kafka.
9. Co unit test va integration test toi thieu cho use-case chinh.
10. Co Dockerfile va pipeline build.
11. Co config dev/test/prod.
12. Khong hard-code secret.

Neu thieu mot muc critical, service chua dat blueprint.

## 16. Anti-Patterns Cam Ap Dung

- Dung `RuntimeException` chung chung cho tat ca loi business.
- Dung `Map<String, Object>` lam API/event contract dai han.
- Frontend tu join du lieu cua nhieu service cho use-case nghiep vu phuc tap khi backend da co orchestrator.
- Service A doc truc tiep bang cua service B.
- Controller goi repository truc tiep.
- Tra entity persistence ra API.
- Phat Kafka event truc tiep ma khong co schema/version.
- Log PII/token o level info.
- Dung `ddl-auto=update` lam chien luoc migration production.
- Hard-code URL service khac trong code.

## 17. Ap dung cho LogisticSystem

Voi repo hien tai, muc tieu best-practice la:

- `api-gateway`: edge, auth, rate limit, route control.
- `authentication-service`: identity platform, token, 2FA, token verification contract.
- `logistics-service`: orchestration va composition layer, uu tien stateless.
- `shipment-service`: aggregate chinh, publish event typed.
- `driver-service`: master data driver + availability.
- `vehicle-service`: master data vehicle + availability.
- `tracking-service`: event-driven tracking read model.
- `notification-service`: event-driven notification processor co persistence neu can history.

Neu can chon thu tu nang cap, uu tien:

1. Error handling + typed response
2. Typed event + outbox roadmap
3. API versioning
4. Notification persistence
5. Resilience cho service-to-service client
6. Distributed tracing
