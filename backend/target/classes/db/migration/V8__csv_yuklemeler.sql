CREATE TABLE csv_yuklemeler (
    id              BIGSERIAL PRIMARY KEY,
    kullanici_id    BIGINT NOT NULL REFERENCES kullanicilar(id),
    dosya_adi       VARCHAR(255) NOT NULL,
    durum           yukleme_durumu NOT NULL DEFAULT 'ISLENIYOR',
    toplam_satir    INTEGER DEFAULT 0,
    islenen_satir   INTEGER DEFAULT 0,
    hata_mesaji     TEXT,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE giderler
    ADD CONSTRAINT fk_giderler_csv_yukleme
    FOREIGN KEY (csv_yukleme_id) REFERENCES csv_yuklemeler(id);

CREATE INDEX idx_csv_yuklemeler_kullanici_id ON csv_yuklemeler(kullanici_id);
