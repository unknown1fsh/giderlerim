# Security Standard

## Kimlik doğrulama — JWT

- Tüm korumalı endpoint'ler `Authorization: Bearer <token>` başlığı gerektirir.
- Token üretimi ve doğrulaması backend'de yapılır.
- Token süresi kısa tutulur (varsayılan: 1 saat); refresh token mekanizması eklenir.
- Token'lar localStorage'a yazılmaz — `httpOnly` cookie veya memory state tercih edilir.
- Token içine hassas veri (şifre, kart numarası vb.) konulmaz.

## CORS yapılandırması

- İzin verilen origin'ler ortam değişkeninden okunur — kod içinde sabit URL yazılmaz.
- `*` (wildcard) origin üretim ortamında kullanılmaz.
- Sadece gerekli HTTP metodlarına izin verilir.

```java
// Örnek — Spring Boot
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(List.of(env.getProperty("ALLOWED_ORIGIN")));
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    config.setAllowedHeaders(List.of("*"));
    config.setAllowCredentials(true);
    // ...
}
```

## Input doğrulama

- Tüm request body'leri Jakarta Validation anotasyonları ile doğrulanır (`@Valid`, `@NotBlank`, `@Size`, `@Email` vb.).
- Doğrulama hatası mesajları Türkçe yazılır.
- Doğrulama controller katmanında tetiklenir, servis katmanında tekrar edilmez.

```java
public record KullaniciOlusturRequest(
    @NotBlank(message = "Ad alanı boş bırakılamaz") String ad,
    @Email(message = "Geçerli bir e-posta adresi giriniz") String email
) {}
```

## Hassas veri

- Şifreler BCrypt ile hash'lenir — düz metin olarak saklanmaz, loglanmaz.
- Token, şifre, API anahtarı loglanmaz (bkz. [Loglama Standardı](logging-standard.md)).
- Kişisel veriler (TC kimlik no, IBAN vb.) şifreli saklanır.
- `.env` dosyaları ve secrets asla git'e commit'lenmez.

## Credential yönetimi

- Tüm gizli değerler (DB şifresi, JWT secret, API anahtarı) ortam değişkeninden okunur.
- Varsayılan veya zayıf şifreler kullanılmaz.
- JWT secret üretimde en az 256 bit rastgele değer olur.

## SQL injection önleme

- Tüm sorgular JPA/Hibernate parametreli sorgularla yazılır.
- Native SQL kullanılıyorsa yine parametreli sorgular kullanılır — string birleştirme kesinlikle yasaktır.

## HTTPS

- Üretim ortamında yalnızca HTTPS kullanılır.
- HTTP istekleri HTTPS'e yönlendirilir.
- Railway otomatik HTTPS sağlar; ek yapılandırma gerekmez.

## Hata mesajlarında bilgi sızıntısı

- API hata response'ları stack trace içermez.
- "Kullanıcı bulunamadı" yerine güvenlik gerektiren yerlerde "Kullanıcı adı veya şifre hatalı" gibi birleşik mesaj kullanılır.
- 500 hataları kullanıcıya iç detay vermez.

## Yetkilendirme

- Her endpoint için erişim seviyesi açıkça tanımlanır.
- Rol bazlı erişim kontrolü (RBAC) Spring Security ile uygulanır.
- "Herkese açık" endpoint'ler açıkça işaretlenir; varsayılan korumalıdır.
