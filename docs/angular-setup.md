# Angular Setup Guide

## Folder structure

```
src/app/
├── shared/
│   ├── components/
│   │   ├── page-container/
│   │   ├── page-header/
│   │   ├── filter-panel/
│   │   ├── summary-card/
│   │   ├── form-section/
│   │   ├── data-table/
│   │   ├── action-bar/
│   │   ├── confirm-dialog/
│   │   ├── empty-state/
│   │   ├── error-state/
│   │   └── loading-state/
│   ├── models/
│   ├── services/
│   └── utils/
├── core/
├── features/
└── app.routes.ts
```

## Rules

- All shared components live in `src/app/shared/components/`
- Feature modules live in `src/app/features/` and import from shared
- Backend calls are made through Angular services in `src/app/shared/services/`
- Interfaces and models live in `src/app/shared/models/`

## State management

**Basit / orta projeler** — Signals + Service:
- State, `signal()` kullanan singleton servisler içinde yönetilir.
- HTTP verisi `HttpClient` + RxJS ile servis katmanından alınır.

**Büyük projeler** — NgRx:
- 3+ feature modülü veya karmaşık paylaşılan state varsa NgRx kullanılır.
- Feature store, effects ve selectors yapısı uygulanır.
- Şüphe durumunda NgRx eklemeden önce proje büyüklüğünü değerlendir.

```
src/app/
├── core/
│   └── store/        # NgRx root state (büyük projeler)
├── features/
│   └── {ozellik}/
│       └── store/    # NgRx feature store (büyük projeler)
└── shared/
    └── services/     # Signals tabanlı state (basit projeler)
```

## Every screen must handle

- `loading` — show loading-state component while fetching
- `empty` — show empty-state component when list is empty
- `error` — show error-state component when fetch fails
- `responsive` — layout must work on mobile, tablet, and desktop

## Dependency rule

Do not introduce a second UI library. Use Angular Material or the existing framework choice — do not mix.
