# Giderlerim

Giderlerim, harcamaları web ve mobil uygulamalardan yönetmek için geliştirilmiş yapay zekâ destekli kişisel finans uygulamasıdır. Gider ve kategori takibi, aylık bütçeler, uyarılar, CSV/Excel ve belge içe aktarma, harcama analizleri, AI finans koçu, abonelik planları ve destek yönetimi sunar.

## Mimari

Bu depo npm workspaces kullanan bir monorepodur:

```text
giderlerim/
├── backend/          Java 17 ve Spring Boot REST API
├── frontend/         Next.js ve React web uygulaması
├── mobile/           Expo ve React Native mobil uygulaması
├── packages/shared/  Web ve mobilin ortak tip, servis, hook ve store kodu
├── docker/           Yerel geliştirme Docker dosyaları
└── docs/             Mimari ve geliştirme standartları
```

İstek akışı:

```text
Web / Mobil
    ↓
@giderlerim/shared API istemcisi
    ↓
Spring Security ve JWT
    ↓
Controller → Service → Repository → PostgreSQL
```

Backend katmanları aşağı doğru bağımlıdır. Controller sınıfları yalnızca HTTP sözleşmesini yönetir, iş kuralları servislerde bulunur ve entity nesneleri API yanıtı olarak dışarı verilmez.

## Teknolojiler

- Backend: Java 17, Spring Boot 3, Spring Security, JPA/Hibernate, Flyway
- Veritabanı: PostgreSQL
- Web: Next.js 16, React 19, TypeScript, TanStack Query, Zustand, Tailwind CSS
- Mobil: Expo 54, React Native, Expo Router
- Ortak istemci: TypeScript workspace paketi (`@giderlerim/shared`)
- Entegrasyonlar: OpenAI ve Shopier
- Dağıtım: Docker ve Railway

## Özellikler

- Kullanıcı kaydı, JWT oturumu ve profil yönetimi
- Gider ve özel kategori yönetimi
- Aylık kategori bütçeleri ve kullanım uyarıları
- Dashboard, günlük harcama ve kategori dağılımı
- CSV/Excel ile toplu gider aktarımı
- PDF ve fiş/belge üzerinden gider çıkarma
- AI harcama analizi, anomali tespiti ve tasarruf önerileri
- AI finans koçu sohbetleri
- Shopier üzerinden plan yükseltme
- Kullanıcı destek talepleri ve admin paneli

## Yerel geliştirme

Gereksinimler:

- Java 17
- Maven 3.9+
- Node.js 20+
- PostgreSQL

Kurulum:

```bash
cp .env.example .env
npm ci
```

Web ve backend'i birlikte başlatmak için:

```bash
npm run dev:full
```

Ayrı ayrı çalıştırmak için:

```bash
npm run dev:backend
npm run dev:frontend
npm run dev:mobile
```

Varsayılan geliştirme adresleri:

- Web: `http://localhost:3000`
- Backend: `http://localhost:8081`
- API: `http://localhost:8081/api/v1`
- Sağlık kontrolü: `http://localhost:8081/api/v1/actuator/health`

## Doğrulama

```bash
npm run verify:frontend
npm run verify:mobile
npm run verify:backend
```

## Veritabanı

Şema `backend/src/main/resources/db/migration/` altındaki elle yazılmış Flyway migration dosyalarıyla yönetilir. Hibernate yalnızca şema doğrulaması yapar; otomatik şema üretimi kullanılmaz.

## Ortam değişkenleri

Gerekli değişkenlerin açıklamaları [.env.example](.env.example) içinde bulunur. Gerçek anahtarlar ve parolalar repoya eklenmemelidir.

## Ayrıntılı dokümantasyon

- [Mimari](docs/architecture.md)
- [API standardı](docs/api-standard.md)
- [Backend yapısı](docs/backend-structure.md)
- [Veritabanı standardı](docs/database-standard.md)
- [Güvenlik standardı](docs/security-standard.md)
- [Test standardı](docs/testing-standard.md)
- [Git iş akışı](docs/git-workflow.md)

## Lisans

MIT — Copyright 2026 SCINAR
