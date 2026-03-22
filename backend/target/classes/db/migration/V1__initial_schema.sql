-- Enum type'ları
CREATE TYPE plan_turu AS ENUM ('FREE', 'PREMIUM', 'ULTRA');
CREATE TYPE para_birimi AS ENUM ('TRY', 'USD', 'EUR');
CREATE TYPE odeme_yontemi AS ENUM ('NAKIT', 'KREDI_KARTI', 'BANKA_KARTI', 'HAVALE', 'DIGER');
CREATE TYPE giris_turu AS ENUM ('MANUEL', 'CSV', 'OCR', 'SES');
CREATE TYPE mesaj_rolu AS ENUM ('KULLANICI', 'ASISTAN');
CREATE TYPE analiz_turu AS ENUM ('HARCAMA_ANALIZI', 'BUTCE_ONERISI', 'ANOMALI_TESPITI', 'AYLIK_OZET', 'KATEGORI_ICGORU', 'TASARRUF_FIRSATI');
CREATE TYPE uyari_turu AS ENUM ('BUTCE_ASIMI', 'BUTCE_YAKLASIYOR', 'ANORMAL_HARCAMA', 'GIZLI_KACINAK', 'TASARRUF_FIRSATI', 'AYLIK_OZET');
CREATE TYPE yukleme_durumu AS ENUM ('ISLENIYOR', 'TAMAMLANDI', 'HATA');

-- Kullanıcılar
CREATE TABLE kullanicilar (
    id                  BIGSERIAL PRIMARY KEY,
    ad                  VARCHAR(100) NOT NULL,
    soyad               VARCHAR(100) NOT NULL,
    email               VARCHAR(255) NOT NULL,
    sifre_hash          VARCHAR(255) NOT NULL,
    plan                plan_turu NOT NULL DEFAULT 'FREE',
    para_birimi         para_birimi NOT NULL DEFAULT 'TRY',
    avatar_url          VARCHAR(500),
    aktif               BOOLEAN NOT NULL DEFAULT TRUE,
    email_dogrulandi    BOOLEAN NOT NULL DEFAULT FALSE,
    son_giris_tarihi    TIMESTAMP,
    deleted_at          TIMESTAMP,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_kullanicilar_email UNIQUE (email)
);

CREATE INDEX idx_kullanicilar_email ON kullanicilar(email);
CREATE INDEX idx_kullanicilar_plan ON kullanicilar(plan);
CREATE INDEX idx_kullanicilar_aktif ON kullanicilar(aktif);
