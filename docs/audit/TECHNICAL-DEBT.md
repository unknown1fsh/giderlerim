# Teknik Borç Kaydı

| ID | Borç | Etki | Öncelik | Efor | Bağımlılık |
|---|---|---|---|---|---|
| TD-01 | Para birimi fark etmeyen aggregate'ler | Finansal yanlışlık | P0 | L | Ürün kur/ledger kararı, #1 |
| TD-02 | Fail-open webhook ve payload logu | Sahte ödeme / veri ifşası | P0 | S | #2 |
| TD-03 | Soft-delete ile unique constraint çelişkisi | Bütçe oluşturma hatası | P1 | S | #3 |
| TD-04 | Stateless refresh token yaşam döngüsü | Oturum iptali zayıf | P1 | M | #4 |
| TD-05 | Idempotency ve atomik kota yok | Çift kayıt/limit aşımı | P1 | M | #5 |
| TD-06 | DB finansal CHECK / optimistic lock yok | Bozuk veri/lost update | P1 | M | #6 |
| TD-07 | Gerçek PostgreSQL ve tenant testleri yok | Regresyon riski | P1 | M | #7 |
| TD-08 | Mobil workspace kurulumu doğrulanamıyor | Release güveni yok | P1 | M | #8 |
| TD-09 | Retention/backup/restore standardı yok | Uyum ve felaket riski | P1 | M | #9 |
| TD-10 | Sınırsız pagination/rate limit yok | Kaynak tüketimi | P1 | S-M | #12 |
| TD-11 | Production dependency advisory'leri | Bilinen zafiyet yüzeyi | P1 | L | #14 |
| TD-12 | UI/E2E/a11y otomasyonu yok | UX regresyonu | P2 | M | #13 |
| TD-13 | Büyük AI servisleri ve senkron dış çağrı | Bakım/hata izolasyonu | P2 | M | Adapter/job tasarımı |
| TD-14 | Operasyon runbook/SLO/trace standardı yok | MTTR yüksek | P2 | M | Altyapı kararı |

Efor: S ≤3 gün, M 1–2 sprint, L çoklu sprint/ürün kararı. Sıralama finansal doğruluk → güvenlik → veri bütünlüğü → test/CI → ürün genişlemesi şeklindedir.
