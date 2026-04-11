# Shopier ödeme sonrası plan teslimatı

Backend’de Shopier webhook’u tanımlı değilse plan güncellemesi **otomatik olmaz**. Aşağıdaki operasyonel akışı kullanın.

## Ürün → plan eşlemesi (canlı linkler)

| Ürün | Shopier URL | Admin’de plan |
|------|-------------|----------------|
| Giderlerim Pro — Aylık | `https://shopier.com/ssayinovation/46065275` | **PREMIUM** (Pro) |
| Giderlerim Pro — Yıllık | `https://shopier.com/ssayinovation/46065306` | **PREMIUM** (Pro) |
| Giderlerim Ultra — Aylık | `https://shopier.com/ssayinovation/46065334` | **ULTRA** |
| Giderlerim Ultra — Yıllık | `https://shopier.com/ssayinovation/46065493` | **ULTRA** |

Kodda ortam değişkenleri: `NEXT_PUBLIC_SHOPIER_PRO_AYLIK`, `PRO_YILLIK`, `ULTRA_AYLIK`, `ULTRA_YILLIK` (Next.js); mobilde `EXPO_PUBLIC_SHOPIER_PRO_AYLIK`, `EXPO_PUBLIC_SHOPIER_ULTRA_AYLIK`. Ayrıntı: kök `.env.example`.

## 1. Sipariş geldiğinde

1. Shopier bildirim e-postası veya panelde siparişi açın.
2. Ödeme yapan **e-posta** ile Giderlerim’de kayıtlı kullanıcıyı eşleştirin (müşteri notunda “uygulama e-postam” istemeniz önerilir).
3. Admin panelden ilgili kullanıcının planını güncelleyin: **PREMIUM** (Pro) veya **ULTRA** (Ultra), satın alınan ürün adına göre.

## 2. Müşteri iletişimi

- Başarılı ödeme sonrası tarayıcı: `/odeme/basarili` sayfası “kısa süre içinde plan” mesajı gösterir.
- 24 saat içinde erişim yoksa **destek@giderlerim.com** (veya güncel destek adresiniz) üzerinden sipariş numarası ile dönüş isteyin.

## 3. İleride otomasyon

- Shopier API / webhook ile sipariş doğrulandığında backend’de kullanıcı `plan` alanını güncelleyen bir endpoint ve imza doğrulama eklenebilir; ürün SKU veya tutar ile `PREMIUM` / `ULTRA` eşlemesi yapılır.
