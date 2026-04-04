# API / backend test durumu

## Otomatik testler

- Komut: `mvn test` (proje kökünden `backend` dizininde).
- Araç: Spring Boot Test, `MockMvc` (`@WebMvcTest`).
- **Auth uçları:** `AuthControllerTest` — kayıt (201), giriş (200), geçersiz gövde (400). `mvn test` ile **3** test çalışır.

Tam kapsamlı integration testler (gerçek PostgreSQL, JWT filtre zinciri, tüm controller’lar) henüz yok; eklenmesi için `@SpringBootTest` + Testcontainers veya H2 profili ayrı bir çalışma olur.

## Vaat / ürün uyumu (özet)

- **Ücretli plan:** Ödeme Shopier sabit linkleri ile yapılır; env değişkenleri `.env.example` içinde listelenmiştir.
- **Ödeme sonrası plan:** Otomatik webhook yoksa manuel süreç — bkz. [shopier-teslimat.md](shopier-teslimat.md).
- **Ultra aile özellikleri:** Landing’de “yakında” olarak işaretli; backend’de ayrı aile modülü yoksa bu bilinçli sınırdır.
