CREATE TABLE giderler (
    id              BIGSERIAL PRIMARY KEY,
    kullanici_id    BIGINT NOT NULL REFERENCES kullanicilar(id),
    kategori_id     BIGINT NOT NULL REFERENCES kategoriler(id),
    tutar           DECIMAL(15,2) NOT NULL,
    para_birimi     para_birimi NOT NULL DEFAULT 'TRY',
    aciklama        VARCHAR(500),
    notlar          TEXT,
    tarih           DATE NOT NULL,
    odeme_yontemi   odeme_yontemi NOT NULL DEFAULT 'NAKIT',
    giris_turu      giris_turu NOT NULL DEFAULT 'MANUEL',
    csv_yukleme_id  BIGINT,
    ai_kategorilendi BOOLEAN NOT NULL DEFAULT FALSE,
    ai_guven_skoru  DECIMAL(3,2),
    anormal_mi      BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at      TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_giderler_kullanici_id ON giderler(kullanici_id);
CREATE INDEX idx_giderler_kategori_id ON giderler(kategori_id);
CREATE INDEX idx_giderler_tarih ON giderler(tarih);
CREATE INDEX idx_giderler_kullanici_tarih ON giderler(kullanici_id, tarih);
CREATE INDEX idx_giderler_odeme_yontemi ON giderler(odeme_yontemi);
CREATE INDEX idx_giderler_anormal_mi ON giderler(anormal_mi) WHERE anormal_mi = TRUE;
