-- Yapay zeka özellikleri için açık rıza (#34). Varsayılan kapalı; kullanıcı ilk kullanımda onaylar ve istediği an geri alır.
ALTER TABLE kullanicilar
    ADD COLUMN ai_izni              BOOLEAN     NOT NULL DEFAULT FALSE,
    ADD COLUMN ai_izni_tarihi       TIMESTAMP,
    ADD COLUMN ai_izni_metin_surumu VARCHAR(20);
