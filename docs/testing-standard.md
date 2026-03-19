# Testing Standard

## Genel kural

Her proje için test yazılması zorunludur. Test edilmeyen servis katmanı kabul edilmez.

## Backend — Java

### Araçlar
- **JUnit 5** — test framework
- **Mockito** — mock ve stub
- **@SpringBootTest** — integration test
- **Testcontainers** — gerçek veritabanı ile integration test (opsiyonel)

### Birim test (Unit Test)

Servis katmanı birim testi zorunludur.

```java
@ExtendWith(MockitoExtension.class)
class KullaniciServiceTest {

    @Mock
    private KullaniciRepository kullaniciRepository;

    @InjectMocks
    private KullaniciServiceImpl kullaniciService;

    @Test
    void kullaniciBulunamadığındaException_Fırlatılmalı() {
        when(kullaniciRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(KullaniciBulunamadiException.class, () -> kullaniciService.getById(1L));
    }
}
```

Kurallar:
- Repository'ler mock'lanır
- Sadece servis mantığı test edilir
- Her test bağımsız çalışır
- Test isimleri ne test edildiğini açıkça belirtir

### Integration test

Controller endpoint'leri ve veritabanı etkileşimi için:

```java
@SpringBootTest
@AutoConfigureMockMvc
class KullaniciControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void kullaniciListesi_200Döndürür() throws Exception {
        mockMvc.perform(get("/api/v1/kullanicilar"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.success").value(true));
    }
}
```

### Coverage hedefi

| Katman | Minimum |
|--------|---------|
| Service (birim test) | %80 |
| Controller (integration) | Kritik endpoint'ler |
| Repository | Özel sorgular |

## Frontend — React / Next.js

### Araçlar
- **Jest** — test runner
- **React Testing Library** — component test
- **MSW (Mock Service Worker)** — API mock

### Component testi

```tsx
test('LoadingState bileşeni spinner gösterir', () => {
  render(<LoadingState />);
  expect(screen.getByRole('status')).toBeInTheDocument();
});
```

### Servis katmanı testi

```tsx
test('kullanici servisi veriyi döndürür', async () => {
  server.use(http.get('/api/v1/kullanicilar', () => HttpResponse.json({ success: true, data: [] })));
  const result = await kullaniciService.getAll();
  expect(result.success).toBe(true);
});
```

Kurallar:
- Paylaşılan bileşenler (shared components) test edilir
- Kullanıcı etkileşimi test edilir, implementasyon detayları değil
- API çağrıları MSW ile mock'lanır

## Frontend — Angular

### Araçlar
- **Jest** veya **Karma + Jasmine** (proje tercihine göre)
- **Angular Testing Utilities** (`TestBed`, `ComponentFixture`)
- **HttpClientTestingModule** — HTTP mock

### Servis testi

```typescript
it('kullanici listesini döndürmeli', () => {
  kullaniciService.getAll().subscribe(response => {
    expect(response.success).toBeTrue();
  });
  const req = httpMock.expectOne('/api/v1/kullanicilar');
  req.flush({ success: true, data: [] });
});
```

## Test dosyası isimlendirme

| Dil | Format |
|-----|--------|
| Java | `KullaniciServiceTest.java` |
| React | `KullaniciListesi.test.tsx` |
| Angular | `kullanici.service.spec.ts` |

## Genel kurallar

- Test dosyaları kaynak dosyanın yanında veya ayrı bir `test/` dizininde tutulur
- Her test bağımsız çalışır, sıraya bağımlı değildir
- Mock veriler gerçekçi ve Türkçe olur
- Test isimleri ne beklendiğini açıkça ifade eder
