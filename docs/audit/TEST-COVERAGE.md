# Test Kapsamı

## 2026-10-19 doğrulama sonucu

| Katman | Komut/kanıt | Sonuç | Yorum |
|---|---|---|---|
| Backend | Maven verify | **Başarılı: 13 test, 0 hata** | Unit/controller ağırlıklı; gerçek PostgreSQL yok |
| Web | Workspace verify | **Başarılı** | ESLint, TypeScript ve Next production build; 29 statik rota üretildi |
| Mobil | Workspace verify | **Başarısız** | Expo/RN modülleri ve `expo/tsconfig.base` kurulum ağacında yok; kaynak doğrulamasına ulaşmadı |
| Bağımlılık | `npm audit --omit=dev` | **46 bulgu** | 25 high, 21 moderate, 0 critical |

İlk backend çalıştırmada eski build çıktılarının JDK uyumsuzluğu görüldü. Kilitli log dosyasına dokunulmadan yalnız derleme klasörleri temizlenip yeniden derlendi; sonuç başarılıdır.

## Kritik kapsama boşlukları

- PostgreSQL/Testcontainers ile Flyway ve repository aggregate testleri.
- Her sorgu için kullanıcı A/B tenant izolasyonu ve IDOR negatif testleri.
- TRY/USD/EUR karışık veri, yuvarlama ve kur tarihi senaryoları.
- Webhook yanlış/eksik imza, replay ve hassas log redaksiyonu.
- Paralel gider/import yazması, idempotency ve plan limiti.
- Soft-delete sonrası bütçe yeniden oluşturma.
- Web kritik yol E2E/a11y; mobil kurulum + smoke/E2E.

## Hedef kalite kapıları

PR'da backend unit + PostgreSQL integration, web lint/type/build + kritik Playwright, mobil install/typecheck/smoke çalışmalı. Coverage yüzdesi tek başına kapı olmamalı; P0 iş kurallarının senaryo bazlı kapsanması zorunlu olmalıdır. Takip: #7 ve #8.
