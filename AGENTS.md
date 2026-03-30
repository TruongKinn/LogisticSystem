# Repository Guidelines

## Project Structure & Module Organization
This repository is a multi-module logistics platform. The root [`pom.xml`](./pom.xml) aggregates the backend services in `api-gateway/`, `authentication-service/`, `driver-service/`, `logistics-service/`, `notification-service/`, `shipment-service/`, `tracking-service/`, and `vehicle-service/`. Each Spring Boot service follows the usual layout: `src/main/java`, `src/main/resources`, and `src/test/java`, with local `Dockerfile` and `Jenkinsfile` files.

The Angular dashboard lives in `frontend/`, with app code under `frontend/src/app`, static assets in `frontend/public`, and workspace config in `frontend/angular.json`. Shared documentation is in `documents/general/`. Infrastructure files such as `docker-compose.yml`, `initdb.sql`, and `prometheus.yml` stay at the repo root. Avoid editing or committing generated output from `target/`, `dist/`, `node_modules/`, or `run-logs/`.

## Build, Test, and Development Commands
Use the root for full builds:

- `mvn clean package -DskipTests` builds all backend modules.
- `docker compose up -d --build` starts the full local stack.

Use module directories for focused work:

- `cd shipment-service; mvn test` runs that service's Spring Boot tests.
- `cd api-gateway; mvn spring-boot:run` starts one backend service locally.
- `cd frontend; npm install` installs UI dependencies.
- `cd frontend; npm start` runs the Angular dev server.
- `cd frontend; npm run build` creates the production bundle.
- `cd frontend; npm test` runs Karma/Jasmine tests.

## Coding Style & Naming Conventions
Backend code targets Java 17 and Spring Boot 3.3.x. Keep Java formatting consistent with existing files and use 4-space indentation. Package roots are service-specific: most modules use `vn.logistic.<service>`, while `authentication-service` still uses `vn.agent.*`; preserve the existing package for the module you touch.

Frontend formatting follows `frontend/.editorconfig`: 2 spaces, UTF-8, trailing newline, and single quotes in `*.ts`. Match established names such as `*Controller`, `*Service`, `*Repository`, `*ApplicationTests`, and Angular `*.spec.ts`.

## Testing Guidelines
Backend tests use `spring-boot-starter-test`; frontend tests use Jasmine with Karma. Place Java tests in `src/test/java` with the same package structure as production code. Add or update a regression test for any behavior change. If a change crosses service boundaries, document manual verification in the PR when automated coverage is not practical.

## Commit & Pull Request Guidelines
Git history uses short conventional-style subjects such as `feat: ...` and `docs: ...`. Keep commit scopes narrow and service-focused. PRs should name affected modules, note config or schema changes, and list the commands used for verification. Include screenshots for frontend changes and example request/response payloads for API-facing updates.
