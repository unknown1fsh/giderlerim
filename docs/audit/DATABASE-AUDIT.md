# Veritabanı Denetimi

## Genel değerlendirme

PostgreSQL + Flyway seçimi güçlü; mevcut şema indeksler ve foreign key'lerle temel bütünlük sağlıyor. Puan: **55/100**; finansal invariants ve eşzamanlılık kontrolleri üretim öncesi güçlendirilmeli.

## Bulgular

| Önem | Kanıt | Sorun | Düzeltme |
|---|---|---|---|
| Kritik | `GiderRepository` içindeki çoklu `SUM(g.tutar)` | Para birimleri ayrıştırılmıyor | #1: birim bazlı aggregate veya normalize ledger |
| Yüksek | V4 unique `(kullanici_id,kategori_id,ay,yil)` + `deleted_at` | Soft-delete sonrası yeniden oluşturma engellenir | #3: PostgreSQL partial unique index |
| Yüksek | Şemada pozitif tutar/eşik kontrolleri yok | Uygulama dışı veya hatalı yazma bozuk veri üretir | #6: `CHECK`, migration öncesi veri taraması |
| Yüksek | Finansal entity'lerde optimistic version yok | Lost update olası | #6: `@Version` ve çatışma yanıtı |
| Orta | `NUMERIC(15,2)` | Bazı kur/analiz ihtiyaçlarında hassasiyet yetmeyebilir | Para politikası kararı; gerekirse kur için daha yüksek scale |
| Orta | Çok sayıda soft-delete tablo | Unique/index/retention davranışı tablo bazında tutarsızlaşabilir | Ortak politika ve partial index denetimi |

## Güvenli migration sırası

1. Üretim verisini ihlal açısından salt-okunur sorgularla ölçün.
2. Hatalı veriyi karantinaya alın/düzeltin.
3. Constraint ve partial indexleri `NOT VALID`/çevrimiçi stratejiyle ekleyin.
4. Uygulama yazma yolunu yeni modele geçirin.
5. Geri dönüş ve restore tatbikatı yapın.

Migration uygulanmadan önce gerçek veri hacmi, kilit süresi ve PostgreSQL sürümü araştırılmalıdır.
