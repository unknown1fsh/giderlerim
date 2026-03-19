---
applyTo: "backend/**,server/**,api/**,src/main/**,src/backend/**"
---

# Backend Rules

## Layered architecture — strict separation
- Controller layer: routing, request binding, response mapping only. No business logic.
- Service layer: all business logic lives here. Use interfaces for services.
- Repository layer: all persistence logic. No queries in services or controllers.
- Entity layer: JPA/Hibernate entities. Never expose entities directly in API responses.
- DTO layer: separate Request and Response models for every API endpoint.
- Strict call direction: Controller → Service → Repository → Entity. Never skip or reverse layers.

## Clean code
- Every method must have a single responsibility.
- Names must clearly express intent — no abbreviations, no vague names like "data", "info", "obj".
- No magic numbers or magic strings — use constants or enums.
- No dead code, commented-out blocks, or unused imports.
- Use constructor injection, not field injection.
- Centralize exception handling — do not catch and swallow exceptions silently.

## Database
- Default database is PostgreSQL. Write all queries and schema for PostgreSQL first.
- Keep code easily switchable to MySQL — use JPA abstractions and document PostgreSQL-specific usage.
- Database scripts (CREATE TABLE, ALTER TABLE, indexes, constraints) are written manually by the developer. Never generate them automatically.
- Never use hbm2ddl.auto=create, update, or create-drop. Use validate or none only.

## API response standard
- All endpoints use the `/api/v1/` prefix.
- Every response is wrapped in `ApiResponse<T>`: `{ success, message, data }`.
- Paginated list responses include a `pagination` object: `{ page, size, totalElements, totalPages }`.
- Error responses include: `{ success: false, message, errorCode, timestamp }`.
- Validation error responses include an `errors` list: `[{ field, message }]`.
- Refer to `docs/api-standard.md` for full specification.

## Security
- Validate all request bodies with `@Valid` and Jakarta Validation annotations.
- Use BCrypt for password hashing — never store or log plain-text passwords.
- Configure CORS allowed origins from environment variables only — never hardcode.
- Never log tokens, passwords, credit card numbers, or personal identifiers.

## Logging
- Use SLF4J (`@Slf4j`) in all service classes.
- INFO: normal business operations. WARN: handled anomalies. ERROR: unhandled exceptions.
- All unhandled exceptions are logged in `GlobalExceptionHandler` only — not scattered across services.
- Refer to `docs/logging-standard.md` for full specification.

## Language
- Validation messages and API error responses must be written in Turkish.
- Turkish characters (ç, ğ, ı, İ, ö, ş, ü) must be used correctly in all string literals.
