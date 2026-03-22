CREATE TABLE butceler (
    id              BIGSERIAL PRIMARY KEY,
    kullanici_id    BIGINT NOT NULL REFERENCES kullanicilar(id),
    kategori_id     BIGINT NOT NULL REFERENCES kategoriler(id),
    ay              INTEGER NOT NULL CHECK (ay BETWEEN 1 AND 12),
    yil             INTEGER NOT NULL,
    limit_tutar     DECIMAL(15,2) NOT NULL,
    uyari_yuzdesi   INTEGER NOT NULL DEFAULT 80,
    aktif           BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at      TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_butceler_kullanici_kategori_ay_yil UNIQUE (kullanici_id, kategori_id, ay, yil)
);

CREATE INDEX idx_butceler_kullanici_id ON butceler(kullanici_id);
CREATE INDEX idx_butceler_ay_yil ON butceler(kullanici_id, yil, ay);
