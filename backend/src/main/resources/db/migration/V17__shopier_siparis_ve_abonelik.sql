-- Shopier ödeme bildirimleri, siparişler ve abonelikler (#20).

-- Aynı webhook'un (Shopier-Webhook-Id) ikinci kez işlenmesini engeller.
CREATE TABLE odeme_bildirimleri (
    id              BIGSERIAL PRIMARY KEY,
    webhook_id      VARCHAR(100) NOT NULL UNIQUE,
    olay            VARCHAR(50)  NOT NULL,
    govde_izi       VARCHAR(64)  NOT NULL,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE shopier_siparisleri (
    id                  BIGSERIAL PRIMARY KEY,
    shopier_siparis_id  VARCHAR(100) NOT NULL UNIQUE,
    urun_id             VARCHAR(50),
    plan                VARCHAR(20),
    donem               VARCHAR(20),
    tutar               DECIMAL(15,2),
    para_birimi         VARCHAR(3),
    alici_email         VARCHAR(255),
    kullanici_id        BIGINT REFERENCES kullanicilar(id),
    durum               VARCHAR(30)  NOT NULL,
    aciklama            VARCHAR(500),
    created_at          TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP    NOT NULL DEFAULT NOW(),
    CONSTRAINT ck_siparis_durum CHECK (durum IN
        ('ISLENDI', 'KULLANICI_BULUNAMADI', 'URUN_TANIMSIZ', 'TUTAR_UYUSMUYOR', 'ODENMEDI', 'IADE_EDILDI', 'KISMI_IADE')),
    CONSTRAINT ck_siparis_plan CHECK (plan IS NULL OR plan IN ('PREMIUM', 'ULTRA')),
    CONSTRAINT ck_siparis_donem CHECK (donem IS NULL OR donem IN ('AYLIK', 'YILLIK'))
);

CREATE INDEX idx_shopier_siparisleri_durum ON shopier_siparisleri(durum);
CREATE INDEX idx_shopier_siparisleri_kullanici ON shopier_siparisleri(kullanici_id);

CREATE TABLE abonelikler (
    id              BIGSERIAL PRIMARY KEY,
    kullanici_id    BIGINT      NOT NULL REFERENCES kullanicilar(id),
    plan            VARCHAR(20) NOT NULL,
    baslangic       TIMESTAMP   NOT NULL,
    bitis           TIMESTAMP,
    kaynak          VARCHAR(20) NOT NULL,
    siparis_id      BIGINT REFERENCES shopier_siparisleri(id),
    durum           VARCHAR(20) NOT NULL,
    created_at      TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP   NOT NULL DEFAULT NOW(),
    CONSTRAINT ck_abonelik_plan CHECK (plan IN ('PREMIUM', 'ULTRA')),
    CONSTRAINT ck_abonelik_kaynak CHECK (kaynak IN ('SHOPIER', 'ADMIN')),
    CONSTRAINT ck_abonelik_durum CHECK (durum IN ('AKTIF', 'SURESI_DOLDU', 'IPTAL')),
    CONSTRAINT ck_abonelik_tarih CHECK (bitis IS NULL OR bitis > baslangic)
);

CREATE INDEX idx_abonelikler_kullanici_durum ON abonelikler(kullanici_id, durum);
CREATE INDEX idx_abonelikler_aktif_bitis ON abonelikler(bitis) WHERE durum = 'AKTIF';

-- Elle atanmış mevcut ücretli planlar süresiz admin aboneliği olarak korunur;
-- aksi halde ilk Shopier olayında etkin plan hesabı bu kullanıcıları düşürürdü.
INSERT INTO abonelikler (kullanici_id, plan, baslangic, bitis, kaynak, durum)
SELECT id, plan::text, NOW(), NULL, 'ADMIN', 'AKTIF'
FROM kullanicilar
WHERE plan IN ('PREMIUM', 'ULTRA') AND deleted_at IS NULL;
