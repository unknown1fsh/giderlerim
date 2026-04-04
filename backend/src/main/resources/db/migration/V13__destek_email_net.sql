-- Resmi alan adı: giderlerim.net
UPDATE sistem_parametreleri
SET deger = 'destek@giderlerim.net',
    varsayilan_deger = 'destek@giderlerim.net',
    updated_at = NOW()
WHERE anahtar = 'destek.email';
