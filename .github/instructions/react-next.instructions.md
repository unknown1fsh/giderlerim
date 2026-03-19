---
applyTo: "app/**/*.tsx,pages/**/*.tsx,components/**/*.tsx,src/**/*.tsx"
---

# React / Next.js Rules

- Follow the central UI standard.
- Reuse shared components before creating new ones.
- Keep pages compositional.
- Keep the same visual language across dashboard, forms, tables, detail pages, and dialogs.
- Avoid unnecessary dependencies.

## State management

- Use **Zustand** for client-side global state: user session, UI state, sidebar open/close, modal visibility, theme.
- Use **TanStack Query** for all server state: fetching, caching, mutation, and invalidation.
- Do not reach for Context API or Redux — Zustand + TanStack Query covers all standard cases.
- Keep each Zustand store focused on one concern. Do not create a single global mega-store.

```tsx
// Zustand store örneği
import { create } from 'zustand';

interface KullaniciStore {
  kullanici: Kullanici | null;
  girisYap: (kullanici: Kullanici) => void;
  cikisYap: () => void;
}

export const useKullaniciStore = create<KullaniciStore>((set) => ({
  kullanici: null,
  girisYap: (kullanici) => set({ kullanici }),
  cikisYap: () => set({ kullanici: null }),
}));
```

```tsx
// TanStack Query örneği
const { data, isLoading, isError } = useQuery({
  queryKey: ['kullanicilar'],
  queryFn: kullaniciService.getAll,
});
```
