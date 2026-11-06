-- V10'un yerel varsayılanı (http://localhost:3000) üretimde ALLOWED_ORIGIN ortam değişkenini eziyordu.
-- Boş değer "ortam değişkenini kullan" anlamına gelir (SistemParametresiDegerService.metin);
-- yönetim ekranından yine de açıkça değer verilebilir. Elle değiştirilmiş değerlere dokunulmaz.
UPDATE sistem_parametreleri
SET deger = '',
    varsayilan_deger = '',
    aciklama = 'İzin verilen frontend origin adresleri (virgülle ayrılabilir). Boşsa ALLOWED_ORIGIN ortam değişkeni kullanılır.',
    updated_at = NOW()
WHERE anahtar = 'allowed.origin'
  AND deger = 'http://localhost:3000';
