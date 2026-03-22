-- giris_turu enum'una BELGE ekle
ALTER TYPE giris_turu ADD VALUE IF NOT EXISTS 'BELGE';

-- Belge yüklemeler tablosu
CREATE TABLE belge_yuklemeler (
    id              BIGSERIAL PRIMARY KEY,
    kullanici_id    BIGINT NOT NULL REFERENCES kullanicilar(id),
    dosya_adi       VARCHAR(255) NOT NULL,
    dosya_turu      VARCHAR(20) NOT NULL,
    durum           yukleme_durumu NOT NULL DEFAULT 'ISLENIYOR',
    toplam_satir    INTEGER DEFAULT 0,
    islenen_satir   INTEGER DEFAULT 0,
    hata_mesaji     TEXT,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- giderler tablosuna belge_yukleme_id FK ekle
ALTER TABLE giderler
    ADD COLUMN belge_yukleme_id BIGINT;

ALTER TABLE giderler
    ADD CONSTRAINT fk_giderler_belge_yukleme
    FOREIGN KEY (belge_yukleme_id) REFERENCES belge_yuklemeler(id);

CREATE INDEX idx_belge_yuklemeler_kullanici_id ON belge_yuklemeler(kullanici_id);
CREATE INDEX idx_giderler_belge_yukleme_id ON giderler(belge_yukleme_id);
