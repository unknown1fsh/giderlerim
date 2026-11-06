# Proje Envanteri

Denetim tarihi: 2026-10-19  
Dal: `audit-full-repository-2026-10-19`  
Durum sözlüğü: **Doğrulandı** = kod/komutla görüldü; **Kısmi** = mevcut fakat üretim güvencesi eksik; **Araştırılmalı** = çalışma ortamı veya iş kararı gerekiyor.

| Modül | Sorumluluk | Ana bağımlılıklar | Durum | Teknik borç / risk | Önerilen eylem |
|---|---|---|---|---|---|
| `backend` | REST API, kimlik, gider, bütçe, AI, ödeme, yönetim | Java 17, Spring Boot 3.2.3, JPA, Flyway, PostgreSQL | Doğrulandı; `mvn verify` başarılı | Para birimi toplamları, webhook, eşzamanlılık, test derinliği | #1–#7, #12 |
| `frontend` | Web uygulaması ve yönetim ekranları | Next.js 16.4.2, React 19, TypeScript, Zustand | Doğrulandı; lint ve production build başarılı | Otomatik UI/E2E ve erişilebilirlik kanıtı yok | #13 |
| `mobile` | Expo tabanlı mobil istemci | Expo 54, React Native 0.81, TypeScript | Kısmi; doğrulama bağımlılık ağacında durdu | Kurulum yeniden üretilemiyor, CI kapsamı yok | #8 |
| `packages/shared` | Web/mobil ortak tipler ve istemci parçaları | TypeScript workspace | Doğrulandı | Sürümleme/sözleşme testi yok | API sözleşme testleri ekle |
| `backend/.../db/migration` | Şema evrimi | Flyway V1–V14 | Doğrulandı | Finansal CHECK'ler ve soft-delete uyumlu uniqueness eksik | #3, #6 |
| `.github/workflows` | PR doğrulama | GitHub Actions | Kısmi | Mobil doğrulama ve gerçek PostgreSQL entegrasyonu yok | #7, #8 |
| `docker` + kök Dockerfile | Yerel/üretim paketleme | Docker, Compose | Kısmi | Kurtarma, geri dönüş ve gözlemlenebilirlik runbook'u yok | Operasyon runbook'u |
| Shopier entegrasyonu | Ödeme bildirimi | İmza doğrulama, webhook | Kritik risk | Token yokken fail-open; ham payload loglanıyor | #2 |
| OpenAI entegrasyonu | Belge ve harcama analizi/sohbet | OpenAI API | Kısmi | Senkron dış çağrı ve veri yönetişimi açıklığı | Kuyruk, timeout, veri politikası |

## Akış özeti

Web/mobil istemci → Spring REST controller → service → repository → PostgreSQL. Kimlik doğrulama JWT ile stateless çalışıyor. Flyway şemayı yönetiyor; JPA `validate` yaklaşımı şema sürüklenmesini azaltıyor. AI ve ödeme sağlayıcıları backend servislerinden çağrılıyor.

## Çalışma ağacı notu

Denetim başladığında çalışma ağacında kapsamlı, önceden var olan değişiklikler bulunuyordu. Bunlar korunmuştur. Bu çalışma yalnızca raporları ve refresh-token tür kontrolünü eklemiştir; mevcut değişikliklerin sahipliği denetim çıktısı olarak iddia edilmez.
