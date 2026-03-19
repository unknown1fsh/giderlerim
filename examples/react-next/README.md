# React / Next.js Example

This folder contains a reference implementation of the central UI standard for React / Next.js projects.

## Structure

```
src/
├── components/
│   ├── shared/       <- All shared UI building blocks
│   └── feature/      <- Feature-specific components built on top of shared
├── services/         <- All backend API calls
├── hooks/            <- Custom React hooks
├── pages/ or app/    <- Page/route components
└── types/            <- TypeScript interfaces and types
```

## Key rules demonstrated

- Pages import from shared components only
- API calls are in services, not in components
- Every page handles loading, empty, error, and responsive states
- No second UI library is imported
