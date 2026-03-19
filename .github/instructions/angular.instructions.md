---
applyTo: "src/app/**/*.ts,src/app/**/*.html,src/app/**/*.scss,src/app/**/*.css"
---

# Angular Rules

- Follow the central UI standard.
- Frontend must consume backend services through Angular services.
- Reuse shared components and shared wrappers.
- Do not introduce a second UI library.
- Keep templates readable and consistent.
- Avoid unnecessary dependencies.

## State management

**Basit ve orta ölçekli projeler** — Angular Signals + injectable servisler:
- State, `signal()` veya `BehaviorSubject` kullanan singleton servisler içinde tutulur.
- HTTP verisi `HttpClient` + RxJS operatörleri ile servis katmanından alınır.
- Bileşenler state'i doğrudan tutmaz; servisten inject eder.

**Büyük projeler** — NgRx zorunludur:
- 3 veya daha fazla feature modülü
- Karmaşık modüller arası paylaşılan state
- 5 veya daha fazla geliştirici
- NgRx feature stores, effects ve selectors kullanılır.
- Şüphe durumunda NgRx eklemeden önce projenin büyüklüğünü değerlendir.

```typescript
// Signals ile servis tabanlı state örneği
@Injectable({ providedIn: 'root' })
export class KullaniciStore {
  private _kullanici = signal<Kullanici | null>(null);
  readonly kullanici = this._kullanici.asReadonly();

  girisYap(kullanici: Kullanici) { this._kullanici.set(kullanici); }
  cikisYap() { this._kullanici.set(null); }
}
```
