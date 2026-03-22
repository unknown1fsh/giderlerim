-- Admin rolü için kullanicilar tablosuna admin_mi kolonu ekleme
ALTER TABLE kullanicilar ADD COLUMN admin_mi BOOLEAN NOT NULL DEFAULT FALSE;
CREATE INDEX idx_kullanicilar_admin_mi ON kullanicilar (admin_mi);

-- Sistem parametreleri tablosu
CREATE TABLE sistem_parametreleri (
    id          BIGSERIAL PRIMARY KEY,
    anahtar     VARCHAR(100) NOT NULL UNIQUE,
    deger       TEXT         NOT NULL,
    varsayilan_deger TEXT    NOT NULL,
    aciklama    VARCHAR(500),
    tip         VARCHAR(20)  NOT NULL DEFAULT 'STRING',
    kategori    VARCHAR(50)  NOT NULL DEFAULT 'GENEL',
    duzenlenebilir BOOLEAN   NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP    NOT NULL,
    updated_at  TIMESTAMP    NOT NULL
);

CREATE INDEX idx_sistem_parametreleri_kategori ON sistem_parametreleri (kategori);
CREATE INDEX idx_sistem_parametreleri_anahtar ON sistem_parametreleri (anahtar);

-- Varsayılan sistem parametreleri
INSERT INTO sistem_parametreleri (anahtar, deger, varsayilan_deger, aciklama, tip, kategori, created_at, updated_at) VALUES
('jwt.access.expiration.ms',       '3600000',          '3600000',          'JWT access token geçerlilik süresi (ms)',           'NUMBER',  'GUVENLIK', NOW(), NOW()),
('jwt.refresh.expiration.ms',      '604800000',        '604800000',        'JWT refresh token geçerlilik süresi (ms)',          'NUMBER',  'GUVENLIK', NOW(), NOW()),
('cors.allowed.origin',            'http://localhost:3000', 'http://localhost:3000', 'İzin verilen frontend origin (bilgi amaçlı)', 'STRING', 'GUVENLIK', NOW(), NOW()),
('ai.model',                       'claude-sonnet-4-6','claude-sonnet-4-6','Kullanılan Claude AI modeli adı',                   'STRING',  'AI',       NOW(), NOW()),
('ai.max.tokens',                  '4096',             '4096',             'AI yanıtı için maksimum token sayısı',              'NUMBER',  'AI',       NOW(), NOW()),
('ai.analiz.gecerlilik.saat',      '24',               '24',               'AI analiz sonuçlarının geçerlilik süresi (saat)',   'NUMBER',  'AI',       NOW(), NOW()),
('max.dosya.boyutu.mb',            '15',               '15',               'Maksimum dosya yükleme boyutu (MB)',                'NUMBER',  'SISTEM',   NOW(), NOW()),
('bakim.modu',                     'false',            'false',            'Bakım modu aktif mi (true/false)',                  'BOOLEAN', 'SISTEM',   NOW(), NOW()),
('yeni.kayit.aktif',               'true',             'true',             'Yeni kullanıcı kaydı açık mı',                     'BOOLEAN', 'SISTEM',   NOW(), NOW()),
('uygulama.versiyonu',             '1.0.0',            '1.0.0',            'Uygulamanın mevcut sürümü (bilgi amaçlı)',          'STRING',  'SISTEM',   NOW(), NOW()),
('ucretsiz.plan.aylik.gider.limiti','50',              '50',               'FREE planda aylık maksimum gider girişi',           'NUMBER',  'PLAN',     NOW(), NOW()),
('premium.fiyat.try',              '99',               '99',               'Premium plan aylık fiyatı (TRY)',                   'NUMBER',  'PLAN',     NOW(), NOW()),
('ultra.fiyat.try',                '199',              '199',              'Ultra plan aylık fiyatı (TRY)',                     'NUMBER',  'PLAN',     NOW(), NOW()),
('premium.csv.yukleme.limiti',     '-1',               '-1',               'Premium planda aylık CSV yükleme limiti (-1 sınırsız)', 'NUMBER', 'PLAN',  NOW(), NOW()),
('hosgeldiniz.mesaji',             'Giderlerim uygulamasına hoş geldiniz!', 'Giderlerim uygulamasına hoş geldiniz!', 'Kullanıcılara gösterilen hoş geldiniz mesajı', 'STRING', 'GENEL', NOW(), NOW()),
('destek.email',                   'destek@giderlerim.com', 'destek@giderlerim.com', 'Destek e-posta adresi',                  'STRING',  'GENEL',    NOW(), NOW());
