# Central UI Fullstack Starter

> Tüm fullstack projeleriniz için tek kaynak. Mimari standartlar, UI yönetişimi ve geliştirici kuralları — tek bir yerden.

---

## Ne Bu?

Bu depo bir uygulama değil. Bir **standarttır**.

Her yeni projenizde aynı soruları sormayı bırakın:
- *"Klasör yapısı nasıl olacak?"*
- *"API response formatı ne?"*
- *"Branch'i nasıl adlandırayım?"*
- *"State yönetimi için ne kullanalım?"*

Bu template, o soruların yanıtlarını bir kez verir. Sonraki her proje bu temelden başlar, tartışma olmaz, tutarsızlık olmaz.

---

## Teknoloji Yığını

**Backend**
- Java 17 · Spring Boot · JPA / Hibernate
- PostgreSQL (MySQL uyumlu)
- Flyway migration · JWT kimlik doğrulama

**Frontend**
- React / Next.js · TypeScript · Zustand · TanStack Query
- Angular · TypeScript · Signals (büyük projelerde NgRx)

**Altyapı**
- Railway (deploy) · Docker (yerel geliştirme)
- GitHub Actions (CI/CD)

---

## Temel İlkeler

```
Backend yalnızca API sağlar.
Frontend yalnızca backend'i tüketir.
UI tek bir merkezi standartten gelir.
React ve Angular aynı tasarım dilini konuşur.
Gereksiz bağımlılık eklenmez.
Tekrar edilmeden önce paylaşılan örüntü kullanılır.
```

Bunlar tartışmaya açık değil.

---

## Hızlı Başlangıç

```bash
# 1. GitHub'da "Use this template" butonuna tıklayın
# 2. Yeni deponuzu klonlayın
git clone https://github.com/sizin-org/yeni-proje.git
cd yeni-proje

# 3. Ortam değişkenlerini ayarlayın
cp .env.example .env
# .env dosyasını düzenleyin

# 4. Yerel geliştirme ortamını başlatın
docker compose -f docker/docker-compose.yml up -d

# 5. VS Code'da açın ve Copilot'u etkinleştirin
# docs/project-bootstrap-guide.md adımlarını izleyin
```

---

## Paylaşılan Bileşen Sözlüğü

Her proje bu 11 bileşen üzerine inşa edilir. Yeni bileşen oluşturmadan önce bu listeden kontrol edilir.

| Bileşen | Sorumluluk |
|---------|------------|
| `PageContainer` | Sayfa sarmalayıcı — max genişlik, iç boşluk, yerleşim akışı |
| `PageHeader` | Sayfa başlığı, alt başlık, birincil eylem butonları |
| `FilterPanel` | Arama ve filtre girdileri — mobilde daraltılabilir |
| `SummaryCard` | KPI / özet metrik — etiket, değer, trend göstergesi |
| `FormSection` | Bölüm başlığı altında gruplandırılmış form alanları |
| `DataTable` | Sıralanabilir, sayfalı, yüklenme ve boş durum destekli tablo |
| `ActionBar` | Seçili kayıt veya bağlam için eylem butonları |
| `ConfirmDialog` | Geri alınamaz işlemler için onay modalı |
| `EmptyState` | Sıfır kayıt durumu — ikon, mesaj, opsiyonel eylem çağrısı |
| `ErrorState` | Veri çekme hatası — mesaj ve yeniden dene eylemi |
| `LoadingState` | Veri yüklenirken iskelet ekran veya spinner — boş ekran asla |

---

## Mimari

### Backend — Katmanlı Mimari

```
Controller  →  yönlendirme, bağlama, yanıt eşleme
    ↓
Service     →  tüm iş mantığı (arayüz + implementasyon)
    ↓
Repository  →  tüm kalıcılık işlemleri
    ↓
Entity      →  JPA nesneleri — API'ye hiçbir zaman çıkmaz
```

Her katman yalnızca bir altındakini çağırır. Katlan atlanmaz, ters yönde çağrı yapılmaz.

### API Response Formatı

Tüm endpoint'ler aynı zarfı kullanır:

```json
{
  "success": true,
  "message": "İşlem başarıyla tamamlandı",
  "data": { }
}
```

Sayfalı liste:

```json
{
  "success": true,
  "message": null,
  "data": [ ],
  "pagination": {
    "page": 0,
    "size": 20,
    "totalElements": 150,
    "totalPages": 8
  }
}
```

Hata:

```json
{
  "success": false,
  "message": "Kullanıcı bulunamadı",
  "errorCode": "USER_NOT_FOUND",
  "timestamp": "2026-03-19T10:00:00Z"
}
```

### Frontend — State Yönetimi

**React / Next.js**

```
TanStack Query  →  sunucu state'i (API verisi, önbellek, mutasyon)
Zustand         →  istemci state'i (oturum, UI state, sidebar, modal)
useState        →  yalnızca o bileşene özgü geçici state
```

**Angular**

```
Signals + Servis  →  basit ve orta ölçekli projeler
NgRx              →  büyük projeler (3+ feature modülü, 5+ geliştirici)
```

---

## Git Kuralları

### Branch isimlendirme

```
feature/kullanici-giris
feature/siparis-listesi
fix/login-yonlendirme-hatasi
chore/spring-boot-guncelleme
```

### Commit formatı

```
<tip>: <kısa Türkçe açıklama>
```

| Tip | Kullanım |
|-----|----------|
| `feat` | Yeni özellik |
| `fix` | Hata düzeltme |
| `refactor` | Davranış değişmeden yeniden düzenleme |
| `docs` | Yalnızca dokümantasyon |
| `test` | Test ekleme veya düzenleme |
| `chore` | Bağımlılık, yapılandırma değişikliği |

```
feat: kullanıcı kayıt formu eklendi
fix: şifre sıfırlama bağlantısı düzeltildi
refactor: sipariş servisi arayüze taşındı
chore: spring-boot 3.3.0 sürümüne güncellendi
```

### Akış

```
feature/yeni-ozellik  →  PR aç  →  CI geçmeli  →  master'a merge  →  branch sil
```

`master`'a doğrudan push yapılmaz.

---

## Klasör Yapısı

### React / Next.js

```
src/
├── components/
│   ├── shared/        # 11 merkezi bileşen
│   └── feature/       # Özelliğe özel bileşenler
├── services/          # Tüm API çağrıları burada — component içinde asla
├── stores/            # Zustand store'ları
├── hooks/             # Custom hook'lar
├── types/             # TypeScript tipleri
└── app/ veya pages/
```

### Angular

```
src/app/
├── shared/
│   ├── components/    # 11 merkezi bileşen
│   ├── services/      # HTTP servisleri ve state
│   └── models/        # Arayüzler ve tipler
├── core/              # Guard, interceptor, uygulama geneli servisler
└── features/          # Özellik modülleri
```

### Backend

```
com.scinar.{projeadi}/
├── config/            # Spring yapılandırması
├── controller/        # İnce katman — sadece yönlendirme
├── service/           # İş mantığı (interface + impl/)
├── repository/        # JPA repository'leri
├── entity/            # JPA entity'leri
├── dto/
│   ├── request/       # Gelen veri modelleri
│   └── response/      # Giden veri modelleri
└── exception/         # Özel exception'lar + GlobalExceptionHandler
```

---

## CI/CD

**PR Validation** — her pull request'te otomatik çalışır:
- Java 17 build + Maven test
- Node.js build + lint

**Deploy** — `master`'a merge sonrası:
- Railway CLI ile otomatik deploy

GitHub repository'nize `RAILWAY_TOKEN` secret'ını eklemeyi unutmayın.

---

## Copilot Entegrasyonu

Bu depo GitHub Copilot için özel yapılandırılmıştır.

| Dosya | Kapsam |
|-------|--------|
| `.github/copilot-instructions.md` | Global zorunlu kurallar |
| `.github/instructions/backend.instructions.md` | Backend dosyaları |
| `.github/instructions/frontend.instructions.md` | Frontend dosyaları |
| `.github/instructions/react-next.instructions.md` | React / Next.js dosyaları |
| `.github/instructions/angular.instructions.md` | Angular dosyaları |

**Copilot Agent'ları:**

| Agent | Görev |
|-------|-------|
| `UI Guardian` | Merkezi UI standardını korur, tutarsızlığı önler |
| `Frontend Architect` | Paylaşılan bileşenlerden ekran oluşturur |
| `Backend Architect` | Frontend ihtiyaçları için API ve servis mimarisi tasarlar |

Yeni proje başladığında Copilot Chat'e şunu gönderin:

```
Depo kurallarını şu andan itibaren otomatik olarak uygula.
Merkezi mimariyi koru:
- backend yalnızca servis sağlar
- frontend yalnızca backend'i tüketir
- UI merkezi standarda uymalı
- React ve Angular aynı UI felsefesini izlemeli
Depo yapısını analiz ederek başla.
```

---

## Görsel Tema Felsefesi

Bu projelerden genel görünümlü, kurumsal, varsayılan arayüzler çıkmaz.

Her projenin kendi güçlü görsel kimliği olur:
- Koyu temalar, zengin renk paletleri
- Alışılmadık tipografi
- Atmosferik arka planlar
- Kendine özgü yerleşim karakteri

Tek kural: proje kendi teması içinde **tutarlı** olur.

---

## Veritabanı

- Varsayılan: **PostgreSQL**
- Uyumluluk: MySQL — yalnızca dialect değişikliği yeterli
- Migration: **Flyway** — dosyalar elle yazılır, asla otomatik üretilmez
- `hbm2ddl.auto=create/update/create-drop` kesinlikle yasak — yalnızca `validate` veya `none`

Migration isimlendirmesi:
```
V1__initial_schema.sql
V2__kullanici_tablosu.sql
V3__siparis_kolonlari_ekle.sql
```

---

## Dil

Tüm uygulamalar Türkçe olarak geliştirilir.

- UI metinleri, etiketler, yer tutucular, buton adları, doğrulama mesajları, hata mesajları — Türkçe
- Backend doğrulama ve API hata mesajları — Türkçe
- Türkçe karakterler (ç, ğ, ı, İ, ö, ş, ü) doğru kullanılır — ASCII ikamesi yasak
- UTF-8 karakter seti zorunlu

---

## Dokümantasyon

| Doküman | İçerik |
|---------|--------|
| [Mimari](docs/architecture.md) | Katmanlı mimari, Railway deploy kuralları |
| [UI Standardı](docs/ui-standard.md) | Paylaşılan bileşenler ve görsel kurallar |
| [Proje Başlangıç Rehberi](docs/project-bootstrap-guide.md) | Yeni proje başlatma adımları |
| [React / Next.js Kurulumu](docs/react-next-setup.md) | Dizin yapısı, Zustand, TanStack Query |
| [Angular Kurulumu](docs/angular-setup.md) | Dizin yapısı, Signals, NgRx |
| [API Standardı](docs/api-standard.md) | Response formatı, endpoint kuralları, pagination |
| [Git Workflow](docs/git-workflow.md) | Branch modeli, commit formatı, PR süreci |
| [Backend Yapısı](docs/backend-structure.md) | Paket yapısı, kod örnekleri |
| [Veritabanı Standardı](docs/database-standard.md) | İsimlendirme, migration, soft delete |
| [Test Standardı](docs/testing-standard.md) | JUnit 5, Jest, coverage hedefleri |
| [Güvenlik Standardı](docs/security-standard.md) | JWT, CORS, input doğrulama, BCrypt |
| [Loglama Standardı](docs/logging-standard.md) | Log seviyeleri, hassas veri maskeleme |

---

## Lisans

MIT — Copyright 2026 SCINAR
