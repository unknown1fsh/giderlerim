-- Destek talebi enum tipleri
CREATE TYPE destek_durumu AS ENUM ('ACIK', 'YANITLANDI', 'COZULDU', 'KAPATILDI');
CREATE TYPE destek_onceligi AS ENUM ('DUSUK', 'NORMAL', 'YUKSEK', 'ACIL');
CREATE TYPE destek_kategorisi AS ENUM ('GENEL', 'TEKNIK', 'FATURA', 'ONERI', 'HATA');

-- Destek talepleri tablosu
CREATE TABLE destek_talepleri (
    id                      BIGSERIAL PRIMARY KEY,
    kullanici_id            BIGINT NOT NULL REFERENCES kullanicilar(id),
    konu                    VARCHAR(200) NOT NULL,
    mesaj                   TEXT NOT NULL,
    durum                   destek_durumu NOT NULL DEFAULT 'ACIK',
    oncelik                 destek_onceligi NOT NULL DEFAULT 'NORMAL',
    kategori                destek_kategorisi NOT NULL DEFAULT 'GENEL',
    admin_yaniti            TEXT,
    yanitlayan_admin_id     BIGINT REFERENCES kullanicilar(id),
    yanitlanma_tarihi       TIMESTAMP,
    deleted_at              TIMESTAMP,
    created_at              TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_destek_talepleri_kullanici_id ON destek_talepleri(kullanici_id);
CREATE INDEX idx_destek_talepleri_durum ON destek_talepleri(durum);
CREATE INDEX idx_destek_talepleri_durum_oncelik ON destek_talepleri(durum, oncelik);
