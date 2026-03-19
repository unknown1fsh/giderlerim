# React / Next.js Setup Guide

## Folder structure

```
src/
├── components/
│   ├── shared/
│   │   ├── PageContainer.tsx
│   │   ├── PageHeader.tsx
│   │   ├── FilterPanel.tsx
│   │   ├── SummaryCard.tsx
│   │   ├── FormSection.tsx
│   │   ├── DataTable.tsx
│   │   ├── ActionBar.tsx
│   │   ├── ConfirmDialog.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorState.tsx
│   │   └── LoadingState.tsx
│   └── feature/
├── services/           # API çağrıları — hiçbir zaman component içinde inline yapılmaz
├── stores/             # Zustand store'ları (client state)
├── hooks/              # Custom hook'lar
├── pages/ or app/
└── types/
```

## Rules

- All shared components live in `src/components/shared/`
- Feature components live in `src/components/feature/` and import from shared
- API calls are made through `src/services/` — never inline in components
- Custom hooks live in `src/hooks/`
- TypeScript types and interfaces live in `src/types/`
- Zustand stores live in `src/stores/` — one file per concern (e.g., `kullaniciStore.ts`, `uiStore.ts`)

## State management

- **TanStack Query** → server state (API verisi, cache, mutation)
- **Zustand** → client state (kullanıcı oturumu, UI state, sidebar, modal)
- Doğrudan `useState` → bileşene özel geçici state (yalnızca o component'ı etkileyen)

```
src/stores/
├── kullaniciStore.ts    # Giriş yapmış kullanıcı bilgisi
├── uiStore.ts           # Sidebar, tema, genel UI state
└── ...
```

## Every screen must handle

- `loading` — show LoadingState while fetching
- `empty` — show EmptyState when list is empty
- `error` — show ErrorState when fetch fails
- `responsive` — layout must work on mobile, tablet, and desktop

## Dependency rule

Do not add a second UI library. Use the existing framework and shared components.
