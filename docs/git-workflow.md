# Git Workflow

## Branch modeli

`feature/* → master` — basit doğrusal model.

- `master` → her zaman kararlı, production-ready
- `feature/kisa-aciklama` → yeni özellik geliştirme
- `fix/kisa-aciklama` → hata düzeltme
- `chore/kisa-aciklama` → bağımlılık güncellemesi, yapılandırma değişikliği

## Branch isimlendirme

```
feature/kullanici-giris
feature/siparis-listesi
fix/login-yonlendirme-hatasi
fix/tarih-formati
chore/bagimliliklar-guncellendi
chore/railway-yapilandirma
```

Kurallar:
- Küçük harf, tire ile ayrılmış
- Kısa ve açıklayıcı
- Türkçe veya İngilizce — proje içinde tutarlı kal

## Commit mesajı formatı

```
<tip>: <kısa açıklama>
```

**Tipler:**

| Tip | Kullanım |
|-----|----------|
| `feat` | Yeni özellik |
| `fix` | Hata düzeltme |
| `refactor` | Davranış değişmeden kod düzenleme |
| `docs` | Yalnızca dokümantasyon değişikliği |
| `test` | Test ekleme veya düzenleme |
| `chore` | Bağımlılık, yapılandırma, araç değişikliği |

**Örnekler:**

```
feat: kullanıcı kayıt formu eklendi
fix: şifre sıfırlama bağlantısı düzeltildi
refactor: sipariş servisi arayüze taşındı
docs: API standartları eklendi
test: kullanıcı servisi birim testleri eklendi
chore: spring-boot 3.3.0 sürümüne güncellendi
```

**Kurallar:**
- Maksimum 72 karakter
- Türkçe açıklama tercih edilir
- Geçmiş zaman kullanılır (eklendi, düzeltildi, güncellendi)
- Nokta ile bitmez

## Pull Request süreci

1. `feature/*` veya `fix/*` branch'i aç
2. Değişikliklerini commit'le
3. GitHub'da PR aç — `master`'a karşı
4. PR validation workflow'u geçmeli
5. Gözden geçir ve `master`'a merge et
6. Branch'i sil

## Korumalı branch kuralları (master)

- Doğrudan push yapılmaz
- PR zorunlu
- CI geçmeden merge edilmez

## .gitignore temel kuralları

- `target/`, `.mvn/` → Java build çıktıları
- `node_modules/`, `.next/`, `dist/` → Frontend build çıktıları
- `.env`, `.env.local` → Ortam değişkenleri (asla commit'lenmez)
- `*.log` → Log dosyaları
- `.idea/`, `.vscode/` → IDE dosyaları (paylaşılmaz)
