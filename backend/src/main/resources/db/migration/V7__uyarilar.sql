CREATE TABLE uyarilar (
    id              BIGSERIAL PRIMARY KEY,
    kullanici_id    BIGINT NOT NULL REFERENCES kullanicilar(id),
    tur             uyari_turu NOT NULL,
    baslik          VARCHAR(200) NOT NULL,
    mesaj           TEXT NOT NULL,
    okundu_mu       BOOLEAN NOT NULL DEFAULT FALSE,
    ilgili_id       BIGINT,
    deleted_at      TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_uyarilar_kullanici_id ON uyarilar(kullanici_id);
CREATE INDEX idx_uyarilar_okunmamis ON uyarilar(kullanici_id, okundu_mu) WHERE okundu_mu = FALSE;
