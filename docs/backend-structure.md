# Backend Paket Yapısı

## Java proje paket düzeni

```
com.scinar.{projeadi}/
├── config/                  # Spring yapılandırma sınıfları
│   ├── SecurityConfig.java
│   ├── CorsConfig.java
│   └── WebConfig.java
│
├── controller/              # REST controller'lar (ince katman)
│   └── KullaniciController.java
│
├── service/                 # İş mantığı — arayüz + implementasyon
│   ├── KullaniciService.java          (interface)
│   └── impl/
│       └── KullaniciServiceImpl.java
│
├── repository/              # JPA repository arayüzleri
│   └── KullaniciRepository.java
│
├── entity/                  # JPA entity'leri
│   └── Kullanici.java
│
├── dto/                     # Veri transfer nesneleri
│   ├── request/
│   │   ├── KullaniciOlusturRequest.java
│   │   └── KullaniciGuncelleRequest.java
│   └── response/
│       ├── KullaniciResponse.java
│       └── ApiResponse.java
│
├── exception/               # Özel exception sınıfları ve global handler
│   ├── KullaniciBulunamadiException.java
│   ├── GlobalExceptionHandler.java
│   └── HataKodu.java        (enum)
│
└── util/                    # Yardımcı sınıflar (gerekirse)
    └── TarihYardimcisi.java
```

## Controller örneği

```java
@RestController
@RequestMapping("/api/v1/kullanicilar")
@RequiredArgsConstructor
public class KullaniciController {

    private final KullaniciService kullaniciService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<KullaniciResponse>>> listele(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(kullaniciService.listele(page, size));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<KullaniciResponse>> olustur(
            @Valid @RequestBody KullaniciOlusturRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                             .body(kullaniciService.olustur(request));
    }
}
```

## Service arayüzü örneği

```java
public interface KullaniciService {
    ApiResponse<List<KullaniciResponse>> listele(int page, int size);
    ApiResponse<KullaniciResponse> getById(Long id);
    ApiResponse<KullaniciResponse> olustur(KullaniciOlusturRequest request);
    ApiResponse<KullaniciResponse> guncelle(Long id, KullaniciGuncelleRequest request);
    void sil(Long id);
}
```

## ApiResponse wrapper

```java
public record ApiResponse<T>(
    boolean success,
    String message,
    T data
) {
    public static <T> ApiResponse<T> basarili(T data) {
        return new ApiResponse<>(true, null, data);
    }

    public static <T> ApiResponse<T> basarili(String message, T data) {
        return new ApiResponse<>(true, message, data);
    }
}
```

## GlobalExceptionHandler örneği

```java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(KullaniciBulunamadiException.class)
    public ResponseEntity<HataResponse> kullaniciBulunamadi(KullaniciBulunamadiException ex) {
        log.warn("Kayıt bulunamadı: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                             .body(HataResponse.of("KULLANICI_BULUNAMADI", ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<HataResponse> dogrulamaHatasi(MethodArgumentNotValidException ex) {
        List<AlanHatasi> hatalar = ex.getBindingResult().getFieldErrors().stream()
            .map(e -> new AlanHatasi(e.getField(), e.getDefaultMessage()))
            .toList();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                             .body(HataResponse.dogrulamaHatasi(hatalar));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<HataResponse> genelHata(Exception ex, HttpServletRequest request) {
        log.error("Beklenmeyen hata: path={}", request.getRequestURI(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                             .body(HataResponse.of("SUNUCU_HATASI", "Beklenmeyen bir hata oluştu"));
    }
}
```

## Entity örneği

```java
@Entity
@Table(name = "kullanicilar")
@Getter
@Setter
@NoArgsConstructor
public class Kullanici {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String ad;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(nullable = false)
    private boolean aktif = true;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() { createdAt = updatedAt = LocalDateTime.now(); }

    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}
```

## Kurallar

- Her servis arayüzü + implementasyon ikilisi olarak yazılır
- Constructor injection zorunlu (`@RequiredArgsConstructor` Lombok ile)
- Entity'ler hiçbir zaman controller'a kadar çıkmaz
- DTO'lar Java record tercih edilir (Java 17+)
- Özel exception sınıfları iş mantığı ile uyumlu isimlendirilir
