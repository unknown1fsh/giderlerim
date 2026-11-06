# Güvenlik Denetimi

## Sonuç

Kimlik doğrulama temeli makul, ancak ödeme webhook'u ve bağımlılık ağacı nedeniyle üretim riski yüksektir. Puan: **48/100**.

## Güçlü yönler

- Parolalar BCrypt ile işleniyor.
- API oturumu stateless; yetkisiz uçlar açıkça listeleniyor.
- Admin işlemlerinde rol kontrolü ve servis/repository katmanında yaygın kullanıcı kapsamı var.
- Mobil token saklamada SecureStore kullanılıyor.

## Bulgular

| Önem | Durum | Bulgu | Eylem |
|---|---|---|---|
| Kritik | Doğrulandı | Webhook token boşken imza kontrolü başarılı kabul ediliyor | #2: fail-closed, startup validation, replay testi |
| Kritik | Doğrulandı | Kabul edilen webhook'un ham gövdesi INFO loguna yazılıyor | #2: allowlist alanlar, redaksiyon |
| Yüksek | Doğrulandı/düzeltildi | Access token refresh ucunda kabul edilebiliyordu | Tür kontrolü ve regresyon testi eklendi |
| Yüksek | Doğrulandı | Refresh token rotasyon/revocation/session invalidation yok | #4 |
| Yüksek | Doğrulandı | Production npm ağacında 25 high, 21 moderate advisory | #14; major yükseltmeleri kontrollü yap |
| Yüksek | Kısmi | IDOR'a karşı kullanıcı kapsamı var fakat sistematik regresyon paketi yok | #7 |
| Yüksek | Doğrulandı | Rate limit ve merkezi pagination üst sınırı yok | #12 |
| Orta | Doğrulandı | Web access token `sessionStorage` içinde | CSP/XSS sertleştirme; cookie/BFF seçeneği değerlendir |
| Orta | Araştırılmalı | Secret rotation, log retention ve olay müdahale prosedürü belgelenmemiş | Operasyon güvenlik runbook'u |

## Bu denetimde yapılan güvenli düzeltme

`JwtService.isRefreshToken` eklendi ve `AuthServiceImpl.tokenYenile` yalnız `tip=refresh` claim'i taşıyan tokenları kabul edecek şekilde değiştirildi. Regresyon testi access tokenın kullanıcı sorgusuna ulaşmadan reddedildiğini doğruluyor.

## Not

`npm audit` önerilerinin önemli bölümü Expo/React Native/Metro major yükseltmelerine gidiyor. Otomatik `--force` uygulanmamalı; #14 kapsamındaki uyumluluk matrisi ve mobil smoke testleriyle ilerlenmeli.
