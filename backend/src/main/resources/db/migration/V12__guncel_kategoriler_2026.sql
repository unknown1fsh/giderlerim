-- 2026 Türkiye Profesyonel Kategori Güncellemesi
-- Mevcut sistem kategorilerini güncelle (ID'ler V2 migrasyonundaki sıraya göredir)

-- 1. Market & Mutfak
UPDATE kategoriler SET ad = 'Market & Mutfak', ikon = '🛒', renk = '#22C55E' WHERE id = 1 AND sistem_mi = TRUE;
-- 2. Faturalar & Aidat
UPDATE kategoriler SET ad = 'Faturalar & Aidat', ikon = '⚡', renk = '#EAB308' WHERE id = 2 AND sistem_mi = TRUE;
-- 3. Ulaşım & Akaryakıt
UPDATE kategoriler SET ad = 'Ulaşım & Akaryakıt', ikon = '🚗', renk = '#3B82F6' WHERE id = 3 AND sistem_mi = TRUE;
-- 4. Sağlık & Medikal
UPDATE kategoriler SET ad = 'Sağlık & Medikal', ikon = '🏥', renk = '#EF4444' WHERE id = 4 AND sistem_mi = TRUE;
-- 5. Eğlence & Etkinlik
UPDATE kategoriler SET ad = 'Eğlence & Etkinlik', ikon = '🎟️', renk = '#A855F7' WHERE id = 5 AND sistem_mi = TRUE;
-- 6. Giyim & Stil
UPDATE kategoriler SET ad = 'Giyim & Stil', ikon = '👕', renk = '#EC4899' WHERE id = 6 AND sistem_mi = TRUE;
-- 7. Eğitim & Gelişim
UPDATE kategoriler SET ad = 'Eğitim & Gelişim', ikon = '🎓', renk = '#6366F1' WHERE id = 7 AND sistem_mi = TRUE;
-- 8. Yeme & İçme (Dışarı)
UPDATE kategoriler SET ad = 'Yeme & İçme (Dışarı)', ikon = '🍴', renk = '#F97316' WHERE id = 8 AND sistem_mi = TRUE;
-- 9. Kira & Gayrimenkul
UPDATE kategoriler SET ad = 'Kira & Gayrimenkul', ikon = '🏠', renk = '#71717A' WHERE id = 9 AND sistem_mi = TRUE;
-- 10. Sigorta & Güvence
UPDATE kategoriler SET ad = 'Sigorta & Güvence', ikon = '🛡️', renk = '#06B6D4' WHERE id = 10 AND sistem_mi = TRUE;
-- 11. Yatırım & Birikim
UPDATE kategoriler SET ad = 'Yatırım & Birikim', ikon = '📈', renk = '#10B981' WHERE id = 11 AND sistem_mi = TRUE;
-- 12. Diğer
UPDATE kategoriler SET ad = 'Diğer', ikon = '📦', renk = '#94A3B8' WHERE id = 12 AND sistem_mi = TRUE;

-- Yeni Profesyonel Kategoriler (2026 Trendleri)
INSERT INTO kategoriler (ad, ikon, renk, sistem_mi, aktif) VALUES
    ('Dijital Abonelikler', '💻', '#60A5FA', TRUE, TRUE),
    ('Kişisel Bakım', '💅', '#F472B6', TRUE, TRUE),
    ('Tatil & Seyahat', '✈️', '#2DD4BF', TRUE, TRUE),
    ('Evcil Hayvan', '🐾', '#A16207', TRUE, TRUE),
    ('Teknoloji & Cihazlar', '📱', '#475569', TRUE, TRUE),
    ('Borç & Kredi', '💳', '#4B5563', TRUE, TRUE),
    ('Hediye & Bağış', '🎁', '#FB7185', TRUE, TRUE);
