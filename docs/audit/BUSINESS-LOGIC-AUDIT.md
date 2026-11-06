# İş Mantığı Denetimi

## Temel kurallar ve durumları

| Alan | Beklenen kural | Gerçek durum | Risk / iş |
|---|---|---|---|
| Gider | Tutar pozitif ve kullanıcıya ait kategoriyle kaydedilir | DTO düzeyinde kısmi doğrulama; DB garantisi yok | #6 |
| Para birimi | Toplamlar aynı birimde veya kur bilgisiyle hesaplanır | TRY/USD/EUR saklanıyor; sorgular doğrudan `SUM(tutar)` | Kritik, #1 |
| Bütçe | Kullanıcı-kategori-ay-yıl için aktif tek kayıt | Soft delete ile DB unique kuralı çelişiyor | #3 |
| Plan limiti | Paralel isteklerde dahi aşılmaz | Count-then-write paterni | #5 |
| CSV/belge içe aktarma | Retry aynı işlemi çoğaltmaz | Idempotency anahtarı yok | #5 |
| Refresh | Yalnız refresh token kabul edilir | Tür kontrolü bu denetimde eklendi; rotasyon/revocation yok | #4 |
| Hesap silme | Politika uyarınca anonimleştirme/silme | Soft delete; alt veri saklama süresi tanımsız | #9 |
| Uyarı | Aynı eşik için spam üretmez | Tekilleştirme güvencesi araştırılmalı | Uyarı senaryo testi |

## Kritik kullanıcı senaryoları

1. Farklı para birimlerinde gider giren kullanıcı dashboard'da anlamsız bir toplam görebilir. Bu, rapor, bütçe ve AI önerisine zincirleme yayılır.
2. Silinmiş kategori bütçesini aynı ay için tekrar oluşturma DB unique ihlaline düşebilir.
3. Ağ retry'ı veya paralel mobil/web isteği çift gider ve kota aşımı yaratabilir.
4. Hesap kapatma, yasal/ürün politikasına bağlı nihai silme veya anonimleştirmeyi tetiklemiyor.

## Kabul ölçütleri

- Her parasal aggregate açık bir para birimi taşır; dönüşüm kullanılıyorsa kur kaynağı, zamanı ve yuvarlama politikası saklanır.
- Finansal yazmalar idempotent ve transaction sınırında atomiktir.
- Bütçe benzersizliği yalnız aktif satırlara uygulanır.
- Silme/retention davranışı kullanıcıya açıklanır ve otomatik test edilir.
