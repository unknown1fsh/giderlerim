---
applyTo: "frontend/**,src/app/**,src/components/**,src/pages/**,src/views/**,src/modules/**"
---

# Frontend Rules

- Frontend exists only to consume backend services and present UI.
- Do not implement backend business rules in frontend.
- Reuse shared layout, shared form, shared table, shared modal, and shared feedback components.
- Every screen must include loading, empty, error, and responsive states.
- Prefer consistency over one-off flashy UI.
- The developer prefers niche, non-standard visual themes. Do not generate generic or default-looking UIs.
- Do not use plain white backgrounds or default primary color palettes unless the project theme explicitly requires it.
- Apply the project's defined visual identity (dark theme, rich palette, custom typography, etc.) consistently across all screens.
- When no theme is defined yet, ask before defaulting to a generic look.
- Do not add a second UI library.
- All UI text must be in Turkish: labels, placeholders, button names, validation messages, empty state messages, error messages.
- Turkish characters (ç, ğ, ı, İ, ö, ş, ü) must be written correctly, never replaced with ASCII equivalents.
- Ensure UTF-8 charset is declared and fonts support the Turkish character set.
