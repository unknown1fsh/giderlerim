CREATE TABLE ai_analiz_sonuclari (
    id                  BIGSERIAL PRIMARY KEY,
    kullanici_id        BIGINT NOT NULL REFERENCES kullanicilar(id),
    tur                 analiz_turu NOT NULL,
    ay                  INTEGER,
    yil                 INTEGER,
    icerik_json         TEXT NOT NULL,
    gecerlilik_suresi   TIMESTAMP NOT NULL,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_analiz_kullanici_id ON ai_analiz_sonuclari(kullanici_id);
CREATE INDEX idx_ai_analiz_tur ON ai_analiz_sonuclari(kullanici_id, tur, ay, yil);
