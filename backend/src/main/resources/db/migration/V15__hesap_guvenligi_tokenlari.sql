CREATE TABLE hesap_tokenlari (
    id                  BIGSERIAL PRIMARY KEY,
    kullanici_id        BIGINT NOT NULL REFERENCES kullanicilar(id) ON DELETE CASCADE,
    tur                 VARCHAR(30) NOT NULL,
    token_hash          VARCHAR(64) NOT NULL UNIQUE,
    son_kullanma_tarihi TIMESTAMP NOT NULL,
    kullanildi_at       TIMESTAMP,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT ck_hesap_token_turu CHECK (tur IN ('EMAIL_DOGRULAMA', 'SIFRE_SIFIRLAMA'))
);

CREATE INDEX idx_hesap_token_kullanici_tur
    ON hesap_tokenlari(kullanici_id, tur);

CREATE INDEX idx_hesap_token_son_kullanma
    ON hesap_tokenlari(son_kullanma_tarihi);
