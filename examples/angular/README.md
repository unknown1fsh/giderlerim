# Angular Example

This folder contains a reference implementation of the central UI standard for Angular projects.

## Structure

```
src/app/
├── shared/
│   ├── components/   <- All shared UI building blocks
│   ├── models/       <- Interfaces and DTOs
│   ├── services/     <- All backend API calls
│   └── utils/        <- Utility functions
├── core/             <- App-wide singletons (guards, interceptors)
├── features/         <- Feature modules built on top of shared
└── app.routes.ts
```

## Key rules demonstrated

- Feature modules import from shared only
- Backend calls go through Angular services in shared/services
- Every screen handles loading, empty, error, and responsive states
- No second UI library is imported
