# Central Fullstack Rules

These rules are mandatory for this repository.

## Developer profile
- The lead developer is a Java expert. Java is the primary backend language.
- All suggestions, architecture decisions, and code generation must reflect Java best practices.
- Deep knowledge of layered architecture, clean code, and enterprise patterns is assumed and expected.

## Clean code — non-negotiable
- Clean code is a hard rule for all languages: Java backend and any frontend language (TypeScript, JavaScript, etc.).
- Methods must have a single responsibility.
- Names must be meaningful: variables, methods, classes, and files must clearly express intent.
- No magic numbers or magic strings — use constants or enums.
- No dead code, commented-out code blocks, or unused imports.
- Keep methods short and focused. If a method needs a comment to explain what it does, rename or refactor it.
- Avoid deep nesting — extract conditions and loops into well-named methods.
- Code must be readable without explanation.

## Core architecture
- Backend only provides APIs, services, validation, business rules, and persistence.
- Frontend only consumes backend services and presents UI.
- Backend and frontend responsibilities must never be mixed.

## Central UI standard
- UI must come from a single centralized design standard.
- Do not introduce random UI libraries or random CSS frameworks.
- Reuse shared layout, shared form patterns, shared table patterns, shared dialog patterns, and shared feedback patterns.
- Keep spacing, typography, color usage, border radius, and shadow usage consistent.

## Visual theme philosophy — niche over generic
- The developer prefers non-standard, niche, and distinctive visual themes over generic corporate or default-looking UIs.
- Do not default to plain white backgrounds, generic blue primary colors, or off-the-shelf Bootstrap/Material default aesthetics.
- Each project may have its own strong visual identity: dark themes, rich color palettes, unconventional typography, atmospheric backgrounds, or unique layout personalities.
- When generating a new screen or component, ask about or apply the project's defined visual theme — do not fall back to a generic look.
- Visual boldness and character are encouraged as long as they remain internally consistent and do not break the shared component structure.
- Consistency within the project's own theme is mandatory even when the theme itself is unconventional.

## Cross-framework consistency
- React / Next.js and Angular must follow the same design language and layout philosophy.
- Even when implementation differs, visual and structural consistency must be preserved.

## Shared conceptual component set
- PageContainer
- PageHeader
- FilterPanel
- SummaryCard
- FormSection
- DataTable
- ActionBar
- ConfirmDialog
- EmptyState
- ErrorState
- LoadingState

## Dependency discipline
- Do not add heavy dependencies without strong justification.
- Prefer existing framework capabilities and shared components.
- Keep the project lightweight and maintainable.

## Frontend rules
- Frontend must consume backend APIs through a clear service layer.
- Reuse shared UI components before creating new ones.
- Every screen must support loading, empty, error, and responsive states.

## Backend rules — Java layered architecture
- Controllers must remain thin. Only routing, request binding, and response mapping belong here.
- Business logic belongs exclusively in the service layer.
- Persistence belongs in the repository/data access layer. No queries in services or controllers.
- Use DTO/Request/Response models — never expose entity objects directly to the API layer.
- Separate concerns strictly: Controller → Service → Repository → Entity.
- Use interfaces for services and repositories to keep layers decoupled.
- Exception handling must be centralized (e.g. @ControllerAdvice in Spring Boot).
- Each class and method must follow the Single Responsibility Principle.
- Avoid static utility abuse — prefer injectable services.
- Prefer constructor injection over field injection.

## Database rules
- Default database is PostgreSQL. All queries, schema definitions, and configurations must be written for PostgreSQL first.
- Code must remain easily switchable to MySQL without major refactoring. Use standard SQL where possible and document any PostgreSQL-specific syntax.
- Use JPA/Hibernate with dialect configuration so switching databases requires only a config change.
- Database scripts (DDL: CREATE TABLE, ALTER TABLE, indexes, constraints) are ALWAYS written manually by the developer. Never auto-generate or auto-run schema scripts. Flyway or Liquibase migrations must be written by hand.
- Do not use hbm2ddl.auto=create, update, or create-drop in any environment. Only validate or none is acceptable.
- Never generate or suggest automatic schema creation or migration scripts. Always ask the developer to write them manually.

## Deployment platform — Railway
- Default deployment platform is Railway (railway.app).
- All environment variable definitions, service configurations, and deployment-related settings must be compatible with Railway.
- Do not assume a traditional server environment — Railway uses containerized, ephemeral deployments.
- Database connections must use Railway's environment variable conventions (e.g. DATABASE_URL or individual host/port/user/password variables injected by Railway).
- Do not hardcode hostnames, ports, or credentials — always read from environment variables.
- Railway runs one service per container — keep backend and frontend as separate Railway services.
- Health check endpoints must be provided so Railway can verify service availability.

## Language — Turkish first
- All applications are created in Turkish by default.
- All UI text, labels, placeholders, button names, error messages, empty state messages, and validation messages must be written in Turkish.
- Turkish characters (ç, ğ, ı, İ, ö, ş, ü) must be used correctly. Do not replace them with ASCII equivalents (c, g, i, I, o, s, u).
- Ensure the HTML document charset is UTF-8 to support Turkish characters.
- Ensure font choices support the full Turkish character set.
- Backend validation messages and API error responses must also be in Turkish.

## API standard
- All endpoints use the `/api/v1/` prefix.
- Every response uses the standard ApiResponse wrapper: `{ success, message, data }`.
- Paginated responses include a `pagination` object: `{ page, size, totalElements, totalPages }`.
- Error responses include: `{ success: false, message, errorCode, timestamp }`.
- Validation error responses include an `errors` array: `[{ field, message }]`.
- All response messages are in Turkish. JSON field keys remain in English.
- Entity objects are never returned directly from controllers — always use Response DTOs.
- Refer to `docs/api-standard.md` for the complete specification.

## Git workflow
- Branch model: `feature/* → master` (simple linear).
- Branch naming: `feature/kisa-aciklama`, `fix/kisa-aciklama`, `chore/kisa-aciklama`.
- Commit format: `<type>: <short Turkish description>` — max 72 characters, past tense.
- Commit types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`.
- Examples: `feat: kullanıcı kayıt formu eklendi`, `fix: login hatası düzeltildi`.
- Refer to `docs/git-workflow.md` for the complete specification.

## State management — React / Next.js
- Use **Zustand** for client-side global state (UI state, user session, sidebar, modals).
- Use **TanStack Query (React Query)** for server state (API data fetching, caching, mutation).
- Do not use Redux or Context API for global state — Zustand is the standard.
- Keep Zustand stores small and focused on a single concern.

## State management — Angular
- For simple and medium-sized projects: use Angular Signals and injectable services for state.
- For large projects (3 or more feature modules, complex shared state, 5 or more developers): use **NgRx** with feature stores and effects.
- When in doubt about project size, ask before introducing NgRx.

## Security
- All protected endpoints require JWT Bearer token authentication.
- CORS allowed origins must be read from environment variables — never hardcoded.
- All request bodies must be validated with Jakarta Validation annotations (`@Valid`, `@NotBlank`, etc.).
- Passwords are hashed with BCrypt — never stored or logged as plain text.
- Tokens, passwords, and API keys must never appear in logs.
- Refer to `docs/security-standard.md` for the complete specification.

## Logging
- Use SLF4J with `@Slf4j` in all Java service classes.
- Log levels: INFO for normal flow, WARN for handled anomalies, ERROR for unhandled exceptions.
- Never log passwords, tokens, credit card numbers, or personal data.
- All exceptions are caught and logged centrally in `GlobalExceptionHandler`.
- Refer to `docs/logging-standard.md` for the complete specification.

## Forbidden
- Do not mix frontend and backend responsibilities.
- Do not introduce a second design system.
- Do not generate inconsistent layouts.
- Do not add unnecessary dependencies.
- Do not write UI text in English when Turkish is required.
- Do not substitute Turkish characters with ASCII equivalents.
- Do not use hbm2ddl.auto=create, update, or create-drop.
- Do not hardcode credentials, secrets, or environment-specific URLs.
- Do not log passwords, tokens, or sensitive personal data.
