# Mimari Denetim

## Sonuç

Modüler monolit, ürünün mevcut ölçeği için doğru temel. Controller → service → repository ayrımı ve DTO/entity ayrışması genel olarak tutarlı. Puan: **68/100**.

## Güçlü yönler

- Spring Security ile varsayılan korumalı uçlar ve admin rol sınırı bulunuyor.
- İş mantığı çoğunlukla controller'dan servis katmanına taşınmış.
- Flyway + `ddl-auto=validate` şema değişikliklerini izlenebilir tutuyor.
- Web ve mobil ortak TypeScript paketi API sözleşmesi için iyi bir başlangıç.
- Backend, web, mobil ve altyapı sorumlulukları fiziksel olarak ayrılmış.

## Bulgular

| Önem | Durum | Bulgu | Etki | Eylem |
|---|---|---|---|---|
| Kritik | Doğrulandı | Para birimli kayıtlar tek parasal toplamda birleştiriliyor | Dashboard, bütçe ve AI yanlış sonuç üretebilir | GitHub #1 |
| Yüksek | Doğrulandı | Limit kontrolleri `count` ardından insert yapıyor | Paralel istekler plan limitini aşabilir | #5 |
| Yüksek | Doğrulandı | İçe aktarma/oluşturma uçlarında idempotency yok | Retry çift kayıt yaratabilir | #5 |
| Orta | Doğrulandı | AI sağlayıcı çağrıları büyük servislerde ve transaction sınırlarına yakın | Uzayan transaction, hata izolasyonu zayıflığı | Adapter + job/outbox |
| Orta | Doğrulandı | API sayfalaması farklı servislerde doğrudan `PageRequest.of` kullanıyor | Aşırı kaynak tüketimi, tutarsız hata | #12 |
| Orta | Araştırılmalı | Domain olayları ve gözlemlenebilirlik standardı yok | Üretim arızalarında teşhis zor | Metric/trace/SLO standardı |

## Hedef mimari

Monoliti koruyup sınırları sertleştirin: `identity`, `ledger`, `budgeting`, `imports`, `payments`, `ai`, `support/admin`. Para hareketleri için tek bir ledger modeli; dış servisler için port/adapter; uzun işler için kalıcı job/outbox; kritik yazmalar için idempotency anahtarı ve transaction içinde atomik kota kontrolü önerilir.

Mikroservis ayrıştırması şu aşamada önerilmez. Önce finansal doğruluk, veri invariants, entegrasyon testleri ve operasyonel görünürlük tamamlanmalıdır.
