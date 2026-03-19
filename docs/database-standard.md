# Database Standard

## İsimlendirme kuralları

### Tablo isimleri
- `snake_case`, çoğul
- Türkçe veya İngilizce — proje içinde tutarlı kal

```sql
kullanicilar
siparis_kalemleri
urun_kategorileri
```

### Kolon isimleri
- `snake_case`
- Boolean kolonlar `is_` veya `aktif` gibi açıklayıcı ön ekle

```sql
id
ad
soyad
email
is_active       -- veya: aktif
created_at
updated_at
deleted_at
```

### Primary key
- Varsayılan: `id BIGSERIAL` (Long, auto-increment)
- Hassas/dış sistemlerle paylaşılan entity'ler için: `uuid UUID DEFAULT gen_random_uuid()`

### Foreign key
```sql
kullanici_id BIGINT NOT NULL REFERENCES kullanicilar(id)
```

## Audit kolonları

Her tablo aşağıdaki kolonları içerir:

```sql
created_at  TIMESTAMP NOT NULL DEFAULT NOW()
updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
```

Kullanıcı izleme gerekiyorsa:

```sql
created_by  VARCHAR(100)
updated_by  VARCHAR(100)
```

## Soft delete

Silme işlemi gerçek silme yerine işaretleme ile yapılır:

```sql
deleted_at  TIMESTAMP NULL   -- NULL: aktif, değer var: silinmiş
```

Sorgularda `WHERE deleted_at IS NULL` koşulu zorunludur.

## Migration standardı

### Araç seçimi
- Varsayılan: **Flyway**
- Büyük/kurumsal projeler: Liquibase

### Dosya isimlendirmesi (Flyway)

```
V1__initial_schema.sql
V2__kullanici_tablosu_olustur.sql
V3__urun_kolonlari_ekle.sql
V4__siparis_indeksi_ekle.sql
```

Kurallar:
- Sürüm numarası ardışık ve benzersiz
- Açıklama `snake_case`, Türkçe veya İngilizce
- Dosyalar bir kez yazılır, değiştirilmez — değişiklik yeni migration ile yapılır

### Migration dosya yapısı

```
src/main/resources/
└── db/
    └── migration/
        ├── V1__initial_schema.sql
        ├── V2__kullanici_tablosu.sql
        └── V3__urun_kategorisi_ekle.sql
```

### Migration yazma kuralları

```sql
-- V2__kullanici_tablosu.sql

CREATE TABLE kullanicilar (
    id          BIGSERIAL PRIMARY KEY,
    ad          VARCHAR(100) NOT NULL,
    soyad       VARCHAR(100) NOT NULL,
    email       VARCHAR(255) NOT NULL UNIQUE,
    sifre_hash  VARCHAR(255) NOT NULL,
    aktif       BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at  TIMESTAMP NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_kullanicilar_email ON kullanicilar(email);
```

- DDL ifadeleri açık ve okunabilir yazılır
- İndeksler ayrı satırda tanımlanır
- Constraint isimleri anlamlı verilir (`fk_`, `uq_`, `idx_` ön ekleriyle)

## JPA / Hibernate yapılandırması

```properties
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
```

MySQL'e geçiş sadece dialect değişikliği gerektirir:

```properties
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
```

## Index stratejisi

- Primary key otomatik index'lenir
- Foreign key kolonları index'lenir
- Sık sorgulanan filtre kolonları (`email`, `aktif`, `created_at`) index'lenir
- Composite index gerekiyorsa migration'da açıkça tanımlanır
