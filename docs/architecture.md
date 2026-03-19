# Architecture

## Developer profile
The lead developer is a Java expert. Java is the primary backend language. All architecture decisions reflect deep Java and enterprise patterns knowledge.

## Backend — Java layered architecture

Strict layer separation is mandatory. Call direction is always top-down:

```
Controller → Service → Repository → Entity
```

### Controller layer
- Routing, request binding, and response mapping only.
- No business logic whatsoever.
- Returns Response DTOs — never entities.

### Service layer
- All business logic lives here.
- Defined by interfaces; implemented by concrete classes.
- Calls repository layer for persistence.
- Handles transactions.

### Repository layer
- All database queries and persistence operations.
- No business logic.
- Uses JPA/Hibernate or equivalent abstraction.

### Entity layer
- JPA entities representing database tables.
- Never exposed directly in API responses.

### DTO layer
- Separate Request and Response models for each API endpoint.
- Decouples API contract from internal entity structure.

## Frontend
Frontend is responsible for:
- Consuming backend services through a service/API layer
- Rendering UI using shared components
- Client-side interaction and presentation only

## Separation
Backend must never contain UI logic.
Frontend must never contain backend business rules.

## Clean code — non-negotiable for all layers
- Single responsibility per class and method.
- Meaningful names throughout — no vague or abbreviated identifiers.
- No magic numbers or strings — use constants and enums.
- No dead code or commented-out blocks.
- Constructor injection preferred over field injection (Java).
- Centralized exception handling.

## Deployment — Railway

Default deployment platform is Railway (railway.app).

- Backend and frontend are deployed as separate Railway services.
- All configuration (database credentials, API URLs, secrets) must be read from environment variables — never hardcoded.
- Railway injects database connection variables automatically when a PostgreSQL plugin is added; use these directly.
- Keep backend stateless so Railway can restart or redeploy containers without data loss.
- Provide a health check endpoint (e.g. `GET /actuator/health` for Spring Boot) so Railway can monitor service availability.
- Do not assume persistent local filesystem — store files in object storage if file handling is needed.

## Database

### Default: PostgreSQL
- All schema definitions, queries, and configurations target PostgreSQL first.

### MySQL compatibility
- Code must be easily switchable to MySQL.
- Use JPA/Hibernate dialects so switching requires only a configuration change.
- Avoid PostgreSQL-specific syntax where standard SQL suffices; document when unavoidable.

### Schema management — MANUAL ONLY
- Database scripts (DDL: CREATE TABLE, ALTER TABLE, indexes, constraints, sequences) are always written manually by the developer.
- Never use hbm2ddl.auto=create, update, or create-drop. Only `validate` or `none` is allowed.
- Flyway or Liquibase migration files must be hand-written — never auto-generated.
- Do not suggest or generate automatic schema creation under any circumstances.
