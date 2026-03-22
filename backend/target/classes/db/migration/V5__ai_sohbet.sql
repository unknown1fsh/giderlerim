CREATE TABLE ai_sohbet_oturumlar (
    id              BIGSERIAL PRIMARY KEY,
    kullanici_id    BIGINT NOT NULL REFERENCES kullanicilar(id),
    baslik          VARCHAR(200),
    aktif           BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at      TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE ai_sohbet_mesajlari (
    id              BIGSERIAL PRIMARY KEY,
    oturum_id       BIGINT NOT NULL REFERENCES ai_sohbet_oturumlar(id),
    rol             mesaj_rolu NOT NULL,
    icerik          TEXT NOT NULL,
    token_sayisi    INTEGER,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_oturumlar_kullanici_id ON ai_sohbet_oturumlar(kullanici_id);
CREATE INDEX idx_ai_mesajlar_oturum_id ON ai_sohbet_mesajlari(oturum_id);
