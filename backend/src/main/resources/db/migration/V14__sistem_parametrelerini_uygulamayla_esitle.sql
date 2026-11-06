-- Yönetim ekranındaki anahtarları uygulamanın gerçek ayar adlarıyla eşitle.
UPDATE sistem_parametreleri
SET anahtar = 'jwt.expiration.access',
    aciklama = 'Yeni oluşturulan JWT erişim tokenlarının geçerlilik süresi (ms)',
    updated_at = NOW()
WHERE anahtar = 'jwt.access.expiration.ms';

UPDATE sistem_parametreleri
SET anahtar = 'jwt.expiration.refresh',
    aciklama = 'Yeni oluşturulan JWT yenileme tokenlarının geçerlilik süresi (ms)',
    updated_at = NOW()
WHERE anahtar = 'jwt.refresh.expiration.ms';

UPDATE sistem_parametreleri
SET anahtar = 'allowed.origin',
    aciklama = 'İzin verilen frontend origin adresleri (virgülle ayrılabilir)',
    updated_at = NOW()
WHERE anahtar = 'cors.allowed.origin';

UPDATE sistem_parametreleri
SET anahtar = 'openai.model',
    deger = 'gpt-4o',
    varsayilan_deger = 'gpt-4o',
    aciklama = 'OpenAI isteklerinde kullanılan model adı',
    updated_at = NOW()
WHERE anahtar = 'ai.model';

UPDATE sistem_parametreleri
SET anahtar = 'openai.max-tokens',
    aciklama = 'OpenAI yanıtı için maksimum token sayısı',
    updated_at = NOW()
WHERE anahtar = 'ai.max.tokens';

UPDATE sistem_parametreleri
SET aciklama = 'AI analiz sonuçlarının önbellekte geçerli kalacağı süre (saat)',
    updated_at = NOW()
WHERE anahtar = 'ai.analiz.gecerlilik.saat';

UPDATE sistem_parametreleri
SET aciklama = 'Tüm belge ve CSV yüklemeleri için maksimum dosya boyutu (MB)',
    updated_at = NOW()
WHERE anahtar = 'max.dosya.boyutu.mb';

UPDATE sistem_parametreleri
SET aciklama = 'Pro planda aylık CSV yükleme limiti (-1: sınırsız)',
    updated_at = NOW()
WHERE anahtar = 'premium.csv.yukleme.limiti';

-- Henüz çalışma zamanında tüketilmeyen değerler yalnızca mevcut ürün bilgisini gösterir.
UPDATE sistem_parametreleri
SET duzenlenebilir = FALSE,
    aciklama = CASE anahtar
        WHEN 'bakim.modu' THEN 'Bilgi amaçlı bakım modu durumu; bakım filtresi henüz bağlı değildir'
        WHEN 'uygulama.versiyonu' THEN 'Bilgi amaçlı uygulama sürümü'
        WHEN 'premium.fiyat.try' THEN 'Bilgi amaçlı Pro plan aylık fiyatı (TRY)'
        WHEN 'ultra.fiyat.try' THEN 'Bilgi amaçlı Ultra plan aylık fiyatı (TRY)'
        WHEN 'hosgeldiniz.mesaji' THEN 'Bilgi amaçlı hoş geldiniz mesajı'
        WHEN 'destek.email' THEN 'Bilgi amaçlı destek e-posta adresi'
        ELSE aciklama
    END,
    updated_at = NOW()
WHERE anahtar IN (
    'bakim.modu', 'uygulama.versiyonu', 'premium.fiyat.try',
    'ultra.fiyat.try', 'hosgeldiniz.mesaji', 'destek.email'
);
