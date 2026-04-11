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

---

## OAuth Redirect URI ve Webhook (tek konteyner / giderlerim.net)

**Redirect URI (Next.js — tarayıcı):**

- `https://giderlerim.net/shopier/oauth/callback`
- Kaynak: [`frontend/src/app/shopier/oauth/callback/page.tsx`](../frontend/src/app/shopier/oauth/callback/page.tsx)

**Notification URL (Spring Boot — Shopier sunucudan POST atar):**

Tek Docker imajında Next.js dışarıda `8080` dinler; `/api/*` istekleri içeride Spring’e (`8081`) yönlendirilir. Bu yüzden **ayrı “API domain” yoksa** webhook adresi:

- `https://giderlerim.net/api/v1/odeme/shopier/webhook`

**Railway’de “gerçek API köküm” nerede?**

1. Railway → projeniz → **Giderlerim** (veya deploy ettiğiniz) servis.
2. **Settings** → **Networking** / **Public Networking** bölümünde **Generate Domain** veya özel domain ile görünen adres (ör. `giderlerim.net` veya `xxx.up.railway.app`).
3. Bu adres **tek servis** için hem site hem API köküdür: API yolu aynı host üzerinde `/api/v1/...` ile devam eder.
4. `NEXT_PUBLIC_API_URL` üretimde **boş** bırakıldıysa tarayıcı `https://giderlerim.net/api/v1/...` çağırır; webhook da aynı şekilde bu hosta yazılır.

Webhook ucu: [`ShopierWebhookController.java`](../backend/src/main/java/com/scinar/giderlerim/controller/ShopierWebhookController.java) — `POST` gövdesi için [Shopier dokümantasyonu](https://developer.shopier.com/reference/webhook-configuration) uyarınca `Shopier-Signature` başlığı **HMAC-SHA256** ile doğrulanır (paylaşılan **webhook token**).

**Railway (backend runtime) gizli değişkenler** — değerleri repoya koymayın:

- `SHOPIER_WEBHOOK_TOKEN` — uygulama webhook token’ı  
- `SHOPIER_OAUTH_CLIENT_ID` — client id (OAuth token alışverişi için; ileride)  
- `SHOPIER_OAUTH_CLIENT_SECRET` — client secret  

Client id/secret veya webhook token **herhangi bir yerde ifşa olduysa** Shopier geliştirici panelinden **yenileyin** ve eskisini kullanmayın.

Plan alanını otomatik güncelleme (sipariş → PREMIUM/ULTRA) henüz bu webhook içinde yok; sıradaki geliştirme adımıdır.
