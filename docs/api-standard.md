# API Standard

## URL yapısı

Tüm endpoint'ler `/api/v1/` prefix'i ile başlar.

```
GET    /api/v1/kullanicilar
GET    /api/v1/kullanicilar/{id}
POST   /api/v1/kullanicilar
PUT    /api/v1/kullanicilar/{id}
DELETE /api/v1/kullanicilar/{id}
```

## HTTP status kodları

| Durum | Kod | Kullanım |
|-------|-----|----------|
| Başarılı okuma / güncelleme | 200 | GET, PUT |
| Başarılı oluşturma | 201 | POST |
| Başarılı silme | 204 | DELETE |
| Doğrulama hatası | 400 | Geçersiz input |
| Kimlik doğrulama hatası | 401 | Token yok veya geçersiz |
| Yetki hatası | 403 | Token var ama yetkisiz |
| Kayıt bulunamadı | 404 | ID ile sorgu başarısız |
| Çakışma | 409 | Duplicate kayıt |
| Sunucu hatası | 500 | Beklenmeyen hata |

## Standart başarılı response

```json
{
  "success": true,
  "message": "İşlem başarıyla tamamlandı",
  "data": { }
}
```

## Sayfalı liste response

```json
{
  "success": true,
  "message": null,
  "data": [ ],
  "pagination": {
    "page": 1,
    "size": 20,
    "totalElements": 150,
    "totalPages": 8
  }
}
```

## Standart hata response

```json
{
  "success": false,
  "message": "Kullanıcı bulunamadı",
  "errorCode": "USER_NOT_FOUND",
  "timestamp": "2026-03-19T10:00:00Z"
}
```

## Doğrulama hatası response

```json
{
  "success": false,
  "message": "Doğrulama hatası",
  "errors": [
    { "field": "email", "message": "Geçerli bir e-posta adresi giriniz" },
    { "field": "ad", "message": "Ad alanı boş bırakılamaz" }
  ],
  "timestamp": "2026-03-19T10:00:00Z"
}
```

## Kurallar

- `message` değeri her zaman Türkçe yazılır.
- `errorCode` değerleri İngilizce sabit string olur (enum kullanılır), loglama ve frontend yönlendirme için kullanılır.
- JSON alan adları (key'ler) İngilizce kalır; mesajlar Türkçe.
- Entity nesneleri hiçbir zaman doğrudan döndürülmez — her zaman Response DTO kullanılır.
- Pagination parametreleri: `?page=0&size=20&sort=createdAt,desc`

## Pagination varsayılanları

- Varsayılan sayfa boyutu: 20
- Maksimum sayfa boyutu: 100
- Sıralama varsayılanı: `createdAt` azalan

## Sıralama ve filtreleme

Filtreleme parametreleri query string üzerinden alınır:

```
GET /api/v1/kullanicilar?ad=Ali&aktif=true&page=0&size=20
```
