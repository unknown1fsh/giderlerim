# Shopier ödeme sonrası plan teslimatı

Ödenen siparişler Shopier webhook'u (`order.created`) ile **otomatik** olarak plana dönüştürülür; elle müdahale yalnızca otomatik eşleşmeyen siparişler için gerekir.

## Ürün → plan eşlemesi (canlı linkler)

| Ürün | Shopier URL | Admin’de plan |
|------|-------------|----------------|
| Giderlerim Pro — Aylık | `https://shopier.com/ssayinovation/46065275` | **PREMIUM** (Pro) |
| Giderlerim Pro — Yıllık | `https://shopier.com/ssayinovation/46065306` | **PREMIUM** (Pro) |
| Giderlerim Ultra — Aylık | `https://shopier.com/ssayinovation/46065334` | **ULTRA** |
| Giderlerim Ultra — Yıllık | `https://shopier.com/ssayinovation/46065493` | **ULTRA** |

Kodda ortam değişkenleri: `NEXT_PUBLIC_SHOPIER_PRO_AYLIK`, `PRO_YILLIK`, `ULTRA_AYLIK`, `ULTRA_YILLIK` (Next.js); mobilde `EXPO_PUBLIC_SHOPIER_PRO_AYLIK`, `EXPO_PUBLIC_SHOPIER_ULTRA_AYLIK`. Ayrıntı: kök `.env.example`.

## 1. Otomatik akış

1. Shopier, ödenen siparişi `order.created` bildirimiyle gönderir; imza `SHOPIER_WEBHOOK_TOKEN` ile doğrulanır.
2. Aynı bildirim (`Shopier-Webhook-Id`) veya aynı sipariş ikinci kez işlenmez.
3. Sipariş satırındaki ürün kimliği `shopier.urunler.*` ayarıyla plana ve döneme eşlenir; toplam tutar ayardaki fiyattan düşükse veya para birimi TRY değilse plan atanmaz.
4. Alıcının fatura e-postası (yoksa teslimat e-postası) ile kayıtlı kullanıcı bulunur ve abonelik başlatılır: aylık 1 ay, yıllık 1 yıl. Aynı plan aktifken alınan yeni dönem, mevcut bitişten devam eder.
5. Kullanıcının planı, aktif aboneliklerinin en yükseğidir. Süresi dolan abonelikler saat başı kapatılır ve plan düşürülür.
6. `refund.updated` ile tam iade gelirse bağlı abonelik iptal edilir; kısmi iade yalnızca işaretlenir.

## 2. Elle müdahale gereken durumlar (Admin → Ödemeler)

| Durum | Anlamı | Yapılacak |
|-------|--------|-----------|
| Kullanıcı bulunamadı | Alıcı Shopier'de farklı e-posta kullandı | Kullanıcıyı bulup **Kullanıcıya ata** |
| Tutar uyuşmuyor | İndirimli/eksik ödeme veya farklı para birimi | Doğrulayıp **Kullanıcıya ata** veya iade |
| Ürün tanımsız | Ürün kimliği `shopier.urunler` ayarında yok | Ayarı ekleyip kullanıcıya planı admin panelinden verin |
| Kısmi iade | Kısmi iade yapıldı | Planı gerekirse admin panelinden düzenleyin |

Admin panelinden elle verilen planlar süresizdir; FREE yapmak tüm aktif abonelikleri iptal eder.

## 2. Müşteri iletişimi

- Başarılı ödeme sonrası tarayıcı: `/odeme/basarili` sayfası “kısa süre içinde plan” mesajı gösterir.
- 24 saat içinde erişim yoksa **destek@giderlerim.com** (veya güncel destek adresiniz) üzerinden sipariş numarası ile dönüş isteyin.

## 3. Ürün fiyatı veya yeni ürün

Ürün → plan eşlemesi ve beklenen fiyat `backend/src/main/resources/application.properties` içindeki `shopier.urunler.<urunId>.plan|donem|fiyat` anahtarlarıdır. Shopier'de fiyat değişirse bu değerleri de güncelleyin.

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

- `SHOPIER_WEBHOOK_TOKEN` — uygulama webhook token’ı. **Zorunlu (fail-closed):** tanımlı değilse tüm webhook bildirimleri `503` ile, imzası eksik/hatalı bildirimler `401` ile reddedilir. İmza hex veya base64 (isteğe bağlı `sha256=` önekiyle) kabul edilir. Ham gövde loglanmaz; loglarda yalnızca boyut ve gövde parmak izi (SHA-256 ilk 12 karakter) yer alır.  
- `SHOPIER_OAUTH_CLIENT_ID` — client id (OAuth token alışverişi için; ileride)  
- `SHOPIER_OAUTH_CLIENT_SECRET` — client secret  

Client id/secret veya webhook token **herhangi bir yerde ifşa olduysa** Shopier geliştirici panelinden **yenileyin** ve eskisini kullanmayın.

Webhook olay olarak en az `order.created`, iadeler için `refund.updated` seçilmelidir.
