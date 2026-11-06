# Giderlerim Production Hardening Design

## Intent

Denetimde bulunan kimlik, ödeme, veri bütünlüğü, AI, performans, operasyon ve gereksiz kod sorunlarını mevcut Spring Boot + Next.js + Expo mimarisini koruyarak gidermek. Başarı ölçütü; normal kullanıcı/admin ayrımının tüm istemcilerde doğru çalışması, ücretli planların süreli ve izlenebilir olması, içe aktarılan verinin doğrulanması, uzun ağ çağrılarının veritabanı transaction'larını tutmaması ve doğrulama komutlarının tekrar çalıştırılabilmesidir.

## Constraints

- Mevcut kirli çalışma ağacındaki kullanıcı değişiklikleri korunacak.
- Yeni altyapı servisi (Redis, kuyruk, ayrı ödeme servisi) zorunlu tutulmayacak.
- Sağlayıcı sözleşmesi doğrulanmayan Shopier alanları tahmin edilmeyecek; ürün eşlemesi yapılandırma ile açıkça verilecek.
- Güvenlik sınırları, para ayrıştırma ve rol değişiklikleri test-first geliştirilecek.
- Mevcut API yolları mümkün olduğunca geriye uyumlu kalacak.

## Approaches

1. **Mevcut monoliti sertleştirme (seçilen):** Ortak servisler, kısa transaction'lar, Flyway migration'ları ve mevcut istemci yapısı kullanılır. En küçük dağıtım değişikliği ve en düşük operasyon maliyeti.
2. Ödeme/AI/işlemeyi ayrı servislere bölme: daha güçlü ölçeklenir fakat bugünkü yük ve kod tabanı için gereksiz operasyon yükü oluşturur.
3. Mobil/ödeme/AI özelliklerini tamamen kaldırma: riski azaltır fakat kullanıcının “tamamını düzelt” hedefini karşılamaz.

## Design

- Ortak HTTP istemcisi tek seferlik token yenileme yapacak, yeni access ve refresh tokenlarını birlikte saklayacak; yetki hataları tekrar edilmeyecek.
- Mobil giriş/kayıt gerçek `authService` çağrılarını kullanacak; kullanıcı profili `/auth/ben` ile alınacak.
- Ücretli üyelikte başlangıç/bitiş/kaynak alanları tutulacak. Webhook ancak token ve ürün eşlemesi tanımlıysa, başarılı durum ve idempotency anahtarı doğrulanınca plan açacak.
- Auth ve pahalı AI yollarında anahtarları süre sonunda temizlenen, boyutu sınırlı yerel rate limit uygulanacak. Bu tek-instance çözümüdür; yatay ölçeklemede Redis'e taşınır.
- Dosya işleme ve OpenAI çağrıları transaction dışında; sonuç/durum yazımları kısa transaction'larda yapılacak.
- AI belge çıkarımı doğrudan gider yaratmak yerine taslak sonuç üretecek; kullanıcı onay endpoint'i taslakları giderlere dönüştürecek.
- Para ayrıştırma tek locale-aware yardımcıda birleşecek. Bütçe yeniden hesaplama tüm gider mutasyonlarından ve import onayından sonra çalışacak.
- Soft-delete bütçe benzersizliği partial index ile düzeltilecek. Son admin koruması ve admin işlem audit kaydı eklenecek.
- CORS/sistem parametreleri cache'lenecek; admin istatistikleri aggregate sorgulara, N+1 listeler projection/aggregate sorgularına taşınacak.
- Hesap email normalizasyonu düzeltilecek. Email doğrulama/parola sıfırlama için süreli tek kullanımlık token altyapısı ve SMTP adaptörü eklenecek; SMTP yoksa token üretimi yapılmayacak.
- Kullanılmayan şablonlar/bağımlılıklar ve tamamlanmamış OAuth ekranı kaldırılacak; bilgilendirme amaçlı sistem parametreleri admin yüzeyinden çıkarılacak.

## Non-goals

- Shopier'in dokümante edilmemiş payload alanlarını tahmin etmek.
- Redis/kuyruk/mikroservis eklemek.
- Uygulamanın görsel tasarımını baştan yapmak.

