# Ürün Boşluk Analizi

## MoSCoW

### Must

- Para birimi güvenli ledger/aggregate (#1).
- Fail-closed ve replay güvenli ödeme webhook'u (#2).
- Soft-delete uyumlu bütçe benzersizliği (#3).
- Idempotent yazmalar, atomik plan limitleri (#5).
- DB invariants/optimistic concurrency (#6).
- PostgreSQL tenant ve finansal regresyon paketi (#7).
- Yeniden üretilebilir mobil CI (#8).
- Pagination/rate limit/input standardı (#12).
- Bağımlılık advisory triage (#14).

### Should

- Refresh token rotasyon/revocation (#4).
- Retention, nihai hesap silme, backup/restore politikası (#9).
- Hesap, gelir ve transfer-safe cash flow modeli (#10).
- Erişilebilirlik ve kritik kullanıcı yolu otomasyonu (#13).

### Could

- Yinelenen işlemler ve fatura hatırlatmaları (#11).
- Tasarruf hedefleri, nakit akışı tahmini, borç/taksit görünümü.
- Aile/partner paylaşımı ve rol tabanlı ortak cüzdan.

### Won't now

- Geniş banka entegrasyon ağı.
- Yatırım/kripto portföyü.
- Finansal temel düzelmeden yeni üretken-AI özellikleri.
- Erken mikroservis ayrışması.

## Ürün ilkeleri

1. Her sayı açıklanabilir ve aynı para biriminde olmalı.
2. Retry kullanıcının parasal geçmişini değiştirmemeli.
3. AI çıktısı karar desteğidir; kaynağı ve belirsizliği görünür olmalı.
4. Veri dışa aktarılabilir, silinebilir ve kurtarma politikası açık olmalı.
