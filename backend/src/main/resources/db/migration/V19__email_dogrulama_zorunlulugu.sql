-- E-posta doğrulama zorunluluğu (#23). Yalnızca bu sürümden sonra açılan hesaplarda TRUE olur;
-- mevcut kullanıcılar kısıtlanmaz, yalnızca doğrulama hatırlatması görür.
ALTER TABLE kullanicilar
    ADD COLUMN email_dogrulama_zorunlu BOOLEAN NOT NULL DEFAULT FALSE;
