CREATE TABLE kategoriler (
    id              BIGSERIAL PRIMARY KEY,
    kullanici_id    BIGINT REFERENCES kullanicilar(id),
    ad              VARCHAR(100) NOT NULL,
    ikon            VARCHAR(50) NOT NULL DEFAULT 'tag',
    renk            VARCHAR(7) NOT NULL DEFAULT '#6B7280',
    sistem_mi       BOOLEAN NOT NULL DEFAULT FALSE,
    aktif           BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at      TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_kategoriler_kullanici_id ON kategoriler(kullanici_id);
CREATE INDEX idx_kategoriler_sistem_mi ON kategoriler(sistem_mi);

-- Sistem kategorileri (seed data)
INSERT INTO kategoriler (ad, ikon, renk, sistem_mi, aktif) VALUES
    ('Market & Bakkal', 'shopping-cart', '#4CAF50', TRUE, TRUE),
    ('Faturalar & Abonelikler', 'zap', '#2196F3', TRUE, TRUE),
    ('Ulaşım', 'car', '#FF9800', TRUE, TRUE),
    ('Sağlık & İlaç', 'heart', '#F44336', TRUE, TRUE),
    ('Eğlence & Hobi', 'music', '#9C27B0', TRUE, TRUE),
    ('Giyim & Aksesuar', 'tag', '#E91E63', TRUE, TRUE),
    ('Eğitim', 'book', '#3F51B5', TRUE, TRUE),
    ('Yeme & İçme (Dışarıda)', 'utensils', '#FF5722', TRUE, TRUE),
    ('Kira & Konut', 'home', '#795548', TRUE, TRUE),
    ('Sigorta', 'shield', '#607D8B', TRUE, TRUE),
    ('Tasarruf & Yatırım', 'trending-up', '#00BCD4', TRUE, TRUE),
    ('Diğer', 'more-horizontal', '#9E9E9E', TRUE, TRUE);
