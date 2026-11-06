# Giderlerim Production Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Denetimdeki kritik ve önemli bulguların tamamını mevcut monolit içinde testlenmiş, üretimde güvenli davranışlara dönüştürmek.

**Architecture:** Mevcut katmanlı Spring Boot servisleri, ortak TypeScript istemcisi ve Flyway korunur. Dış ağ çağrıları transaction dışına alınır; ödeme, import ve hesap tokenları açık domain servislerine ayrılır.

**Tech Stack:** Java 17, Spring Boot 3.2, PostgreSQL/Flyway, Next.js 16, React 19, Expo 54, TypeScript.

**Spec:** `docs/superpowers/specs/2026-10-31-production-hardening-design.md`

## Global Constraints

- Mevcut kirli çalışma ağacındaki kullanıcı değişikliklerini koru.
- Sağlayıcı payload alanlarını tahmin etme; webhook alan adlarını yapılandırılabilir tut.
- Güvenlik/para/rol davranışlarında RED→GREEN TDD uygula.
- Yeni altyapı servisi ekleme.

## Review Focus

- Eşzamanlı 401 isteklerinde yalnızca bir refresh çağrısı ve en fazla bir retry.
- Eksik ödeme tokenı/ürün eşlemesinde hiçbir plan yetkilendirmesi yapılmaması.
- `1.234,56`, `1,234.56`, negatif ve para sembollü tutarların doğru ayrıştırılması.
- AI/işleme hatasında HATA kaydının rollback olmadan kalması.
- Son aktif adminin rol/pasiflik değişikliğinin reddedilmesi.

---

### Task 1: Auth istemcisi, rol koruması ve mobil gerçek giriş

**Files:** `packages/shared/services/createApiClient.ts`, `mobile/app/(auth)/*.tsx`, `frontend/src/app/(admin)/admin/layout.tsx`, ilgili testler.

**Interfaces:** Produces güvenli `createApiClient`; mobil `services.auth`; admin route guard.

- [ ] 401 single-flight, tek retry, refresh token rotasyonu ve 403 davranış testlerini RED çalıştır.
- [ ] En küçük ortak istemci değişikliğini uygula ve testleri GREEN çalıştır.
- [ ] Mobil demo auth'u gerçek servislerle değiştir; profil/rol testlerini RED→GREEN çalıştır.
- [ ] Web `/admin` rol guard'ını ekle ve menü testleriyle doğrula.

### Task 2: Rate limit ve hesap güvenliği

**Files:** `RateLimitFilter`, auth service/controller/DTO/entity/repository, migrations ve testler.

**Interfaces:** Produces bounded limiter; normalize email; verification/reset token service.

- [ ] Bounded expiry, güvenilir IP ve AI yol limiti testlerini RED→GREEN yap.
- [ ] Email normalizasyon çakışması testini RED→GREEN yap.
- [ ] Tek kullanımlık doğrulama/reset tokenları ve SMTP-yoksa güvenli hata davranışını RED→GREEN yap.

### Task 3: Abonelik ve güvenli Shopier adaptörü

**Files:** subscription/payment entities, repositories, service/controller, `Kullanici`, Flyway, admin DTO ve testler.

**Interfaces:** Produces `UyelikService.planAta(...)`; configurable webhook field/product mapping.

- [ ] Süreli plan, sona erme ve idempotency testlerini RED çalıştır.
- [ ] Migration/domain servisini uygulayıp GREEN çalıştır.
- [ ] Eksik token/eşleme, başarısız durum ve tekrar event testlerini RED→GREEN yap.
- [ ] Raw ödeme gövdesi loglamayı kaldır; ödeme destek adreslerini `.net` ile birleştir.

### Task 4: Import ve bütçe veri bütünlüğü

**Files:** money parser, CSV/belge servisleri, upload status service, budget/alert services, migrations ve testler.

**Interfaces:** Produces `ParaTutariAyrisitirici`; bağımsız status transaction; ortak budget recalculation.

- [ ] TR/EN para formatı testlerini RED→GREEN yap.
- [ ] Fatal import hatasında kalıcı HATA kaydı testini RED→GREEN yap.
- [ ] Soft-delete bütçe yeniden oluşturma migration/testini RED→GREEN yap.
- [ ] Create/update/delete/import sonrası uyarı yeniden hesaplama testlerini RED→GREEN yap.

### Task 5: AI transaction sınırı, taslak onayı ve gizlilik

**Files:** AI services, document draft entity/DTO/controller, migration, frontend/mobile review UI, privacy copy ve testler.

**Interfaces:** Produces transaction-dışı AI çağrısı; `TaslakOnayService`.

- [ ] AI ağ çağrısı sırasında aktif transaction olmadığını gösteren testi RED→GREEN yap.
- [ ] AI çıktısının gider yerine taslak oluşturduğunu ve yalnızca onayda kaydedildiğini RED→GREEN yap.
- [ ] Şema/tutar/tarih/satır sınırlarını test et; gizlilik metnine üçüncü taraf AI aktarımını ekle.

### Task 6: Performans ve admin güvenliği

**Files:** CORS/parameter cache, repositories/services, admin audit entity/migration, controller/service tests.

**Interfaces:** Produces cached parameters; aggregate admin queries; last-admin invariant.

- [ ] Parametre cache invalidation testini RED→GREEN yap.
- [ ] Admin aggregate/N+1 sorgularını repository projection'larına taşı.
- [ ] Son admin ve audit log testlerini RED→GREEN yap.
- [ ] Sayfa boyutlarını 1..100 ve sort alanlarını allowlist ile sınırla.

### Task 7: Dağıtım ve gereksiz kod temizliği

**Files:** Dockerfile/CI, frontend/mobile package manifests, dead components/routes/config entries.

**Interfaces:** No downstream interface.

- [ ] Runtime'ı non-root yap; CI doğrulama komutlarını güncelle.
- [ ] Referansı olmayan frontend şablonlarını ve bağımlılıkları kaldır.
- [ ] Tamamlanmamış Shopier OAuth ekranını ve bilgilendirme-only parametre yüzeyini kaldır.
- [ ] Referansı olmayan mobil bağımlılıkları kaldır; lockfile'ı güncelle.

### Task 8: Tam doğrulama ve regresyon

**Files:** test/config documentation only as needed.

**Interfaces:** Consumes all previous tasks.

- [ ] Backend test/verify, frontend lint/build/test ve mobile install/typecheck/lint/export çalıştır.
- [ ] Test ortamındaki JVM/Expo kurulum sorunlarını kod veya dokümantasyonla gider.
- [ ] Güvenlik ve ödeme regresyon listesini elle gözden geçir; kalan riskleri ledger'a yaz.

