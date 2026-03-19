# Logging Standard

## Log seviyeleri

| Seviye | Kullanım |
|--------|----------|
| `INFO` | Normal iş akışı: kullanıcı girişi, kayıt oluşturma, servis başlatma |
| `WARN` | Beklenmeyen ama ele alınan durum: boş sonuç, yeniden deneme, yavaş sorgu |
| `ERROR` | Ele alınamayan hata: beklenmeyen exception, dış servis çökmesi |
| `DEBUG` | Geliştirme ortamında detaylı akış — üretimde kapalı olur |

## Neyin loglanacağı

**Logla:**
- Uygulama başlatma ve servis hazır bilgisi
- Önemli iş olayları (sipariş oluşturuldu, ödeme tamamlandı)
- Dış servis çağrıları (başlangıç ve sonuç)
- Hata durumları (exception mesajı ve context)
- Güvenlik olayları (başarısız giriş denemesi, yetkisiz erişim)

**Asla loglama:**
- Şifre, token, API anahtarı
- Kredi kartı numarası, IBAN
- TC kimlik numarası ve diğer kişisel hassas veriler
- JWT içeriği

## Loglama formatı — Java (Spring Boot)

Yapılandırma (`application.properties`):

```properties
logging.level.root=WARN
logging.level.com.scinar=INFO
logging.level.org.springframework.web=WARN
logging.pattern.console=%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n
```

Kullanım:

```java
@Slf4j
@Service
public class SiparisServiceImpl implements SiparisService {

    @Override
    public SiparisResponse olustur(SiparisRequest request) {
        log.info("Sipariş oluşturma başladı: kullaniciId={}", request.kullaniciId());
        // ...
        log.info("Sipariş oluşturuldu: siparisId={}", siparis.getId());
        return response;
    }
}
```

## Exception loglama

Exception'lar `@ControllerAdvice` içinde merkezi olarak loglanır:

```java
@ExceptionHandler(Exception.class)
public ResponseEntity<HataResponse> genelHataYoneticisi(Exception ex, HttpServletRequest request) {
    log.error("Beklenmeyen hata: path={}, hata={}", request.getRequestURI(), ex.getMessage(), ex);
    // ...
}
```

- `ex.getMessage()` ve stack trace `ERROR` seviyesinde loglanır
- Kullanıcıya dönen response stack trace içermez

## Hassas veri maskeleme

```java
log.info("Kullanıcı girişi: email={}", maskele(email));

private String maskele(String email) {
    int at = email.indexOf('@');
    return email.substring(0, 2) + "***" + email.substring(at);
}
```

## Üretim ortamı log seviyesi

Railway üretim ortamında:
- Root: `WARN`
- Uygulama paketi: `INFO`
- Hibernate SQL: `WARN` (SQL loglaması kapalı)
- Spring Security: `WARN`

## Frontend loglama

- `console.log` üretim build'inde yer almaz
- Hata durumları kullanıcıya `ErrorState` bileşeni ile gösterilir
- Kritik frontend hataları için Sentry veya benzeri araç entegre edilebilir (opsiyonel)
