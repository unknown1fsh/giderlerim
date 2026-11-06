# Ürün Yol Haritası

## Release 1 — Güvenli temel (0–4 hafta)

Amaç: yanlış finansal sonuç ve doğrudan güvenlik riskini kaldırmak. #1, #2, #3, #4, #5, #6, #8, #12, #14. Çıkış kapısı: karışık para birimi testleri; sahte/replay webhook reddi; paralel yazma testi; mobil clean-install verify; yüksek advisory'ler için kabul edilmiş çözüm/istisna.

## Release 2 — Kanıtlanabilir doğruluk (4–7 hafta)

Amaç: #7 ile Testcontainers PostgreSQL, migration, repository aggregate, tenant izolasyonu ve finansal regresyon paketi. CI'da tekrarlanabilir olmalı; kritik iş kuralları yalnız mock testlerine bağlı kalmamalı.

## Release 3 — Görev başarısı ve erişilebilirlik (7–10 hafta)

Amaç: #13. Hızlı giriş, tutarlı hata/boş/loading durumları, klavye/screen-reader kontrolleri ve web/mobil kritik yol smoke testleri. Ölçüm: gider ekleme başarı oranı ve medyan görev süresi.

## Release 4 — Kişisel finans çekirdeği (10–18 hafta)

Amaç: #10 ve #11. Önce hesap/gelir/transfer ledger'ı, sonra yinelenen işlemler ve hatırlatmalar. Mevcut gider verisi için geriye uyumlu migration ve reconciliation raporu zorunlu.

## Release 5 — Güven ve operasyon (paralel, 18. haftaya kadar)

Amaç: #9; retention, export/erase, backup, restore drill, RPO/RTO, olay müdahalesi ve kullanıcıya açık gizlilik metni.

## Başarı metrikleri

- Finansal aggregate tutarsızlığı: 0 bilinen senaryo.
- Duplicate write oranı: 0; idempotency tekrarları gözlemlenebilir.
- Kritik yol CI başarı oranı: ≥%99, flaky oranı <%1.
- Restore tatbikatı RPO/RTO hedefi içinde.
- Gider ekleme görev süresi ve hata oranında sürüm bazlı iyileşme.
