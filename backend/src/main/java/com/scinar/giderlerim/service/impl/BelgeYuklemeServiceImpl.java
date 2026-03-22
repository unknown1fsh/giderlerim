package com.scinar.giderlerim.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvException;
import com.scinar.giderlerim.config.AnthropicConfig;
import com.scinar.giderlerim.dto.response.ApiResponse;
import com.scinar.giderlerim.dto.response.BelgeYuklemeResponse;
import com.scinar.giderlerim.entity.BelgeYukleme;
import com.scinar.giderlerim.entity.Gider;
import com.scinar.giderlerim.entity.Kategori;
import com.scinar.giderlerim.entity.Kullanici;
import com.scinar.giderlerim.entity.enums.GirisTuru;
import com.scinar.giderlerim.entity.enums.OdemeYontemi;
import com.scinar.giderlerim.entity.enums.ParaBirimi;
import com.scinar.giderlerim.entity.enums.PlanTuru;
import com.scinar.giderlerim.entity.enums.YuklemeDurumu;
import com.scinar.giderlerim.exception.GecersizDosyaException;
import com.scinar.giderlerim.exception.KayitBulunamadiException;
import com.scinar.giderlerim.exception.PlanLimitiAsimException;
import com.scinar.giderlerim.repository.BelgeYuklemeRepository;
import com.scinar.giderlerim.repository.GiderRepository;
import com.scinar.giderlerim.repository.KategoriRepository;
import com.scinar.giderlerim.repository.KullaniciRepository;
import com.scinar.giderlerim.service.BelgeYuklemeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BelgeYuklemeServiceImpl implements BelgeYuklemeService {

    private static final long MAX_DOSYA_BOYUTU = 15L * 1024 * 1024; // 15MB
    private static final String ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
    private static final String ANTHROPIC_VERSIYONU = "2023-06-01";

    private static final List<DateTimeFormatter> TARIH_FORMATLARI = List.of(
            DateTimeFormatter.ofPattern("dd/MM/yyyy"),
            DateTimeFormatter.ofPattern("dd.MM.yyyy"),
            DateTimeFormatter.ofPattern("yyyy-MM-dd"),
            DateTimeFormatter.ofPattern("d/M/yyyy"),
            DateTimeFormatter.ofPattern("d.M.yyyy")
    );

    private final BelgeYuklemeRepository belgeYuklemeRepository;
    private final GiderRepository giderRepository;
    private final KullaniciRepository kullaniciRepository;
    private final KategoriRepository kategoriRepository;
    private final AnthropicConfig anthropicConfig;
    private final RestTemplate restTemplate;

    @Override
    @Transactional
    public ApiResponse<BelgeYuklemeResponse> dosyaYukle(Long kullaniciId, MultipartFile dosya) {
        if (dosya == null || dosya.isEmpty()) {
            throw new GecersizDosyaException("Dosya boş veya seçilmemiş.");
        }

        String dosyaAdi = dosya.getOriginalFilename();
        if (dosyaAdi == null) {
            throw new GecersizDosyaException("Dosya adı belirlenemiyor.");
        }

        String uzanti = dosyaAdi.toLowerCase();
        String dosyaTuru = dosyaTuruBelirle(uzanti);
        if (dosyaTuru == null) {
            throw new GecersizDosyaException(
                    "Desteklenmeyen dosya formatı. Desteklenen formatlar: CSV, XLSX, PDF, JPG, JPEG, PNG, BMP"
            );
        }

        if (dosya.getSize() > MAX_DOSYA_BOYUTU) {
            throw new GecersizDosyaException("Dosya boyutu 15MB'ı aşamaz.");
        }

        Kullanici kullanici = kullaniciRepository.findById(kullaniciId)
                .orElseThrow(() -> new KayitBulunamadiException("Kullanıcı bulunamadı."));

        // Premium kontrolü
        if (kullanici.getPlan() == PlanTuru.FREE) {
            throw new PlanLimitiAsimException("Belge yükleme özelliği Premium veya Ultra plana dahildir.");
        }

        BelgeYukleme yukleme = BelgeYukleme.builder()
                .kullanici(kullanici)
                .dosyaAdi(dosyaAdi)
                .dosyaTuru(dosyaTuru)
                .durum(YuklemeDurumu.ISLENIYOR)
                .toplamSatir(0)
                .islenenSatir(0)
                .build();
        BelgeYukleme kaydedilenYukleme = belgeYuklemeRepository.save(yukleme);

        try {
            switch (dosyaTuru) {
                case "CSV" -> csvIsle(kaydedilenYukleme, dosya, kullanici);
                case "XLSX" -> xlsxIsle(kaydedilenYukleme, dosya, kullanici);
                case "PDF" -> pdfIsle(kaydedilenYukleme, dosya, kullanici);
                case "GORUNTU" -> goruntIsle(kaydedilenYukleme, dosya, kullanici);
            }
            return ApiResponse.basarili("Belge başarıyla işlendi.", entitydenResponse(kaydedilenYukleme));
        } catch (GecersizDosyaException | PlanLimitiAsimException e) {
            kaydedilenYukleme.setDurum(YuklemeDurumu.HATA);
            kaydedilenYukleme.setHataMesaji(e.getMessage());
            belgeYuklemeRepository.save(kaydedilenYukleme);
            throw e;
        } catch (Exception e) {
            kaydedilenYukleme.setDurum(YuklemeDurumu.HATA);
            kaydedilenYukleme.setHataMesaji(e.getMessage());
            belgeYuklemeRepository.save(kaydedilenYukleme);
            log.error("Belge işleme hatası. Kullanıcı: {}, Dosya: {}", kullaniciId, dosyaAdi, e);
            throw new GecersizDosyaException("Belge işlenirken hata oluştu: " + e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<BelgeYuklemeResponse> durumSorgula(Long kullaniciId, Long yuklemeId) {
        BelgeYukleme yukleme = belgeYuklemeRepository.findByIdAndKullaniciId(yuklemeId, kullaniciId)
                .orElseThrow(() -> new KayitBulunamadiException("Yükleme kaydı bulunamadı. ID: " + yuklemeId));
        return ApiResponse.basarili(entitydenResponse(yukleme));
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<BelgeYuklemeResponse>> gecmis(Long kullaniciId) {
        List<BelgeYuklemeResponse> gecmis = belgeYuklemeRepository
                .findByKullaniciIdOrderByCreatedAtDesc(kullaniciId)
                .stream()
                .map(this::entitydenResponse)
                .collect(Collectors.toList());
        return ApiResponse.basarili(gecmis);
    }

    // ========== Dosya İşleyiciler ==========

    private void csvIsle(BelgeYukleme yukleme, MultipartFile dosya, Kullanici kullanici)
            throws IOException, CsvException {
        Kategori varsayilanKategori = varsayilanKategoriGetir(kullanici);

        try (CSVReader csvReader = new CSVReader(
                new InputStreamReader(dosya.getInputStream(), StandardCharsets.UTF_8))) {
            List<String[]> satirlar = csvReader.readAll();
            if (satirlar.isEmpty()) throw new GecersizDosyaException("CSV dosyası boş.");

            String[] baslik = satirlar.get(0);
            int toplamSatir = satirlar.size() - 1;
            yukleme.setToplamSatir(toplamSatir);
            belgeYuklemeRepository.save(yukleme);

            int tarihIndex = -1, aciklamaIndex = -1, tutarIndex = -1, odemeYontemiIndex = -1;
            for (int i = 0; i < baslik.length; i++) {
                String sutun = normalles(baslik[i].trim());
                switch (sutun) {
                    case "tarih", "date" -> tarihIndex = i;
                    case "aciklama", "description", "islem" -> aciklamaIndex = i;
                    case "tutar", "miktar", "amount" -> tutarIndex = i;
                    case "odeme_yontemi", "payment_method", "odeme" -> odemeYontemiIndex = i;
                }
            }
            if (tarihIndex == -1 || tutarIndex == -1) {
                throw new GecersizDosyaException("CSV'de gerekli sütunlar bulunamadı (tarih, tutar).");
            }

            List<Gider> giderler = new ArrayList<>();
            List<String> hatalar = new ArrayList<>();

            for (int i = 1; i < satirlar.size(); i++) {
                String[] satir = satirlar.get(i);
                try {
                    if (satir.length <= Math.max(tarihIndex, tutarIndex)) {
                        hatalar.add("Satır " + i + ": Eksik sütun"); continue;
                    }
                    LocalDate tarih = tarihParse(satir[tarihIndex].trim());
                    BigDecimal tutar = tutarParse(satir[tutarIndex].trim());
                    String aciklama = aciklamaIndex >= 0 && aciklamaIndex < satir.length
                            ? satir[aciklamaIndex].trim() : null;
                    OdemeYontemi odemeYontemi = odemeYontemiIndex >= 0 && odemeYontemiIndex < satir.length
                            ? odemeYontemiParse(satir[odemeYontemiIndex].trim()) : OdemeYontemi.NAKIT;

                    giderler.add(giderOlustur(kullanici, varsayilanKategori, yukleme, tutar, aciklama, tarih, odemeYontemi));
                } catch (Exception e) {
                    hatalar.add("Satır " + i + ": " + e.getMessage());
                }
            }
            yuklemeKapat(yukleme, giderler, hatalar, toplamSatir);
        }
    }

    private void xlsxIsle(BelgeYukleme yukleme, MultipartFile dosya, Kullanici kullanici)
            throws IOException {
        Kategori varsayilanKategori = varsayilanKategoriGetir(kullanici);

        try (Workbook workbook = new XSSFWorkbook(dosya.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            if (sheet == null || sheet.getPhysicalNumberOfRows() < 2) {
                throw new GecersizDosyaException("XLSX dosyası boş veya yeterli veri içermiyor.");
            }

            Row baslikSatiri = sheet.getRow(0);
            int toplamSatir = sheet.getPhysicalNumberOfRows() - 1;
            yukleme.setToplamSatir(toplamSatir);
            belgeYuklemeRepository.save(yukleme);

            int tarihIndex = -1, aciklamaIndex = -1, tutarIndex = -1, odemeYontemiIndex = -1;
            for (int i = 0; i < baslikSatiri.getLastCellNum(); i++) {
                Cell cell = baslikSatiri.getCell(i);
                if (cell == null) continue;
                String sutun = normalles(cell.getStringCellValue().trim());
                switch (sutun) {
                    case "tarih", "date" -> tarihIndex = i;
                    case "aciklama", "description", "islem" -> aciklamaIndex = i;
                    case "tutar", "miktar", "amount" -> tutarIndex = i;
                    case "odeme_yontemi", "payment_method", "odeme" -> odemeYontemiIndex = i;
                }
            }
            if (tarihIndex == -1 || tutarIndex == -1) {
                throw new GecersizDosyaException("XLSX'te gerekli sütunlar bulunamadı (tarih, tutar).");
            }

            List<Gider> giderler = new ArrayList<>();
            List<String> hatalar = new ArrayList<>();
            DataFormatter formatter = new DataFormatter();

            for (int rowIdx = 1; rowIdx <= sheet.getLastRowNum(); rowIdx++) {
                Row satir = sheet.getRow(rowIdx);
                if (satir == null) continue;
                try {
                    String tarihStr = formatter.formatCellValue(satir.getCell(tarihIndex)).trim();
                    String tutarStr = formatter.formatCellValue(satir.getCell(tutarIndex)).trim();
                    LocalDate tarih = tarihParse(tarihStr);
                    BigDecimal tutar = tutarParse(tutarStr);
                    String aciklama = aciklamaIndex >= 0
                            ? formatter.formatCellValue(satir.getCell(aciklamaIndex)).trim() : null;
                    OdemeYontemi odemeYontemi = odemeYontemiIndex >= 0
                            ? odemeYontemiParse(formatter.formatCellValue(satir.getCell(odemeYontemiIndex)).trim())
                            : OdemeYontemi.NAKIT;

                    giderler.add(giderOlustur(kullanici, varsayilanKategori, yukleme, tutar, aciklama, tarih, odemeYontemi));
                } catch (Exception e) {
                    hatalar.add("Satır " + rowIdx + ": " + e.getMessage());
                }
            }
            yuklemeKapat(yukleme, giderler, hatalar, toplamSatir);
        }
    }

    private void pdfIsle(BelgeYukleme yukleme, MultipartFile dosya, Kullanici kullanici)
            throws IOException {
        String pdfMetni;
        try (PDDocument belge = Loader.loadPDF(dosya.getBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            pdfMetni = stripper.getText(belge);
        }

        if (pdfMetni == null || pdfMetni.isBlank()) {
            throw new GecersizDosyaException("PDF dosyasından metin çıkarılamadı.");
        }

        String prompt = """
                Aşağıdaki metin bir banka ekstresi, makbuz veya harcama belgesidir.
                TÜM harcama kalemlerini JSON formatında çıkar. Sadece harcamaları listele, gelirleri dahil etme.
                Format:
                [{"tarih":"YYYY-MM-DD","tutar":0.00,"aciklama":"...","odemeYontemi":"NAKIT"}]
                Sadece JSON dizisi döndür, başka açıklama ekleme.
                odemeYontemi değerleri: NAKIT, KREDI_KARTI, BANKA_KARTI, HAVALE, DIGER
                Tarih bulunamazsa bugünün tarihini kullan: %s
                ---
                %s
                """.formatted(LocalDate.now(), pdfMetni.length() > 8000 ? pdfMetni.substring(0, 8000) : pdfMetni);

        List<Map<String, Object>> mesajlar = List.of(
                Map.of("role", "user", "content", prompt)
        );
        String yanit = claudeApiCagir(mesajlar);
        List<Gider> giderler = jsonYanitiGiderlereCevir(yanit, kullanici, yukleme);
        yuklemeKapat(yukleme, giderler, Collections.emptyList(), giderler.size());
    }

    private void goruntIsle(BelgeYukleme yukleme, MultipartFile dosya, Kullanici kullanici)
            throws IOException {
        byte[] dosyaBytes = dosya.getInputStream().readAllBytes();
        String base64 = Base64.getEncoder().encodeToString(dosyaBytes);
        String mediaType = gorselMediaType(dosya.getOriginalFilename());

        String prompt = """
                Bu görüntü bir makbuz, fiş, banka ekstresi veya harcama belgesidir.
                Görseldeki TÜM harcama kalemlerini JSON formatında çıkar. Sadece harcamaları listele, gelirleri dahil etme.
                Format:
                [{"tarih":"YYYY-MM-DD","tutar":0.00,"aciklama":"...","odemeYontemi":"NAKIT"}]
                Sadece JSON dizisi döndür, başka açıklama ekleme.
                odemeYontemi değerleri: NAKIT, KREDI_KARTI, BANKA_KARTI, HAVALE, DIGER
                Tarih bulunamazsa bugünün tarihini kullan: %s
                """.formatted(LocalDate.now());

        List<Map<String, Object>> icerikListesi = new ArrayList<>();
        Map<String, Object> gorselIcerik = new HashMap<>();
        gorselIcerik.put("type", "image");
        gorselIcerik.put("source", Map.of(
                "type", "base64",
                "media_type", mediaType,
                "data", base64
        ));
        icerikListesi.add(gorselIcerik);
        icerikListesi.add(Map.of("type", "text", "text", prompt));

        List<Map<String, Object>> mesajlar = List.of(
                Map.of("role", "user", "content", icerikListesi)
        );
        String yanit = claudeApiCagir(mesajlar);
        List<Gider> giderler = jsonYanitiGiderlereCevir(yanit, kullanici, yukleme);
        yuklemeKapat(yukleme, giderler, Collections.emptyList(), giderler.size());
    }

    // ========== Claude API ==========

    private String claudeApiCagir(List<Map<String, Object>> mesajlar) {
        HttpHeaders basliklar = new HttpHeaders();
        basliklar.setContentType(MediaType.APPLICATION_JSON);
        basliklar.set("x-api-key", anthropicConfig.getApiAnahtari());
        basliklar.set("anthropic-version", ANTHROPIC_VERSIYONU);

        Map<String, Object> istek = new HashMap<>();
        istek.put("model", anthropicConfig.getModel());
        istek.put("max_tokens", 4096);
        istek.put("messages", mesajlar);

        try {
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(istek, basliklar);
            ResponseEntity<String> yanit = restTemplate.exchange(
                    ANTHROPIC_API_URL, HttpMethod.POST, entity, String.class
            );
            String yanitGovdesi = yanit.getBody();
            if (yanitGovdesi == null) throw new RuntimeException("API boş yanıt döndü.");

            ObjectMapper mapper = new ObjectMapper();
            JsonNode node = mapper.readTree(yanitGovdesi);
            return node.path("content").get(0).path("text").asText();
        } catch (Exception e) {
            log.error("Claude Vision API çağrısı başarısız: {}", e.getMessage());
            throw new RuntimeException("Yapay zeka servisi şu an kullanılamıyor.");
        }
    }

    private List<Gider> jsonYanitiGiderlereCevir(String yanit, Kullanici kullanici, BelgeYukleme yukleme) {
        Kategori varsayilanKategori = varsayilanKategoriGetir(kullanici);
        List<Gider> giderler = new ArrayList<>();

        try {
            // JSON dizisini bul (bazen Claude fazladan metin ekleyebilir)
            String temizYanit = yanit.trim();
            int baslangic = temizYanit.indexOf('[');
            int bitis = temizYanit.lastIndexOf(']');
            if (baslangic == -1 || bitis == -1) {
                log.warn("Claude yanıtında JSON dizisi bulunamadı: {}", temizYanit);
                return giderler;
            }
            temizYanit = temizYanit.substring(baslangic, bitis + 1);

            ObjectMapper mapper = new ObjectMapper();
            JsonNode dizisi = mapper.readTree(temizYanit);

            for (JsonNode item : dizisi) {
                try {
                    String tarihStr = item.path("tarih").asText(LocalDate.now().toString());
                    LocalDate tarih = tarihParse(tarihStr);
                    BigDecimal tutar = new BigDecimal(item.path("tutar").asText("0"));
                    String aciklama = item.path("aciklama").asText(null);
                    OdemeYontemi odemeYontemi = odemeYontemiParse(item.path("odemeYontemi").asText("NAKIT"));

                    if (tutar.compareTo(BigDecimal.ZERO) > 0) {
                        giderler.add(giderOlustur(kullanici, varsayilanKategori, yukleme, tutar, aciklama, tarih, odemeYontemi));
                    }
                } catch (Exception e) {
                    log.debug("JSON item parse hatası: {}", e.getMessage());
                }
            }
        } catch (Exception e) {
            log.error("Claude yanıtı parse hatası: {}", e.getMessage());
        }
        return giderler;
    }

    // ========== Yardımcı Metodlar ==========

    private String dosyaTuruBelirle(String dosyaAdi) {
        if (dosyaAdi.endsWith(".csv")) return "CSV";
        if (dosyaAdi.endsWith(".xlsx") || dosyaAdi.endsWith(".xls")) return "XLSX";
        if (dosyaAdi.endsWith(".pdf")) return "PDF";
        if (dosyaAdi.endsWith(".jpg") || dosyaAdi.endsWith(".jpeg")
                || dosyaAdi.endsWith(".png") || dosyaAdi.endsWith(".bmp")) return "GORUNTU";
        return null;
    }

    private String gorselMediaType(String dosyaAdi) {
        if (dosyaAdi == null) return "image/jpeg";
        String lower = dosyaAdi.toLowerCase();
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".bmp")) return "image/bmp";
        return "image/jpeg";
    }

    private Kategori varsayilanKategoriGetir(Kullanici kullanici) {
        return kategoriRepository.findAllByKullaniciId(kullanici.getId())
                .stream()
                .filter(k -> Boolean.TRUE.equals(k.getSistemMi()) && k.getAd().contains("Diğer"))
                .findFirst()
                .orElseGet(() -> kategoriRepository.findAllByKullaniciId(kullanici.getId())
                        .stream()
                        .filter(k -> Boolean.TRUE.equals(k.getSistemMi()))
                        .findFirst()
                        .orElseThrow(() -> new KayitBulunamadiException("Sistem kategorisi bulunamadı.")));
    }

    private Gider giderOlustur(Kullanici kullanici, Kategori kategori, BelgeYukleme yukleme,
                                BigDecimal tutar, String aciklama, LocalDate tarih, OdemeYontemi odemeYontemi) {
        return Gider.builder()
                .kullanici(kullanici)
                .kategori(kategori)
                .tutar(tutar)
                .paraBirimi(ParaBirimi.TRY)
                .aciklama(aciklama != null && !aciklama.isEmpty() ? aciklama : null)
                .tarih(tarih)
                .odemeYontemi(odemeYontemi)
                .girisTuru(GirisTuru.BELGE)
                .belgeYukleme(yukleme)
                .aiKategorilendi(false)
                .anormalMi(false)
                .build();
    }

    private void yuklemeKapat(BelgeYukleme yukleme, List<Gider> giderler, List<String> hatalar, int toplamSatir) {
        if (!giderler.isEmpty()) {
            giderRepository.saveAll(giderler);
        }
        yukleme.setToplamSatir(toplamSatir > 0 ? toplamSatir : giderler.size());
        yukleme.setIslenenSatir(giderler.size());

        if (giderler.isEmpty() && !hatalar.isEmpty()) {
            yukleme.setDurum(YuklemeDurumu.HATA);
            yukleme.setHataMesaji("İşlenebilecek harcama bulunamadı.");
        } else if (!hatalar.isEmpty()) {
            yukleme.setDurum(YuklemeDurumu.TAMAMLANDI);
            yukleme.setHataMesaji(hatalar.size() + " satır işlenemedi.");
        } else {
            yukleme.setDurum(YuklemeDurumu.TAMAMLANDI);
        }
        belgeYuklemeRepository.save(yukleme);
        log.info("Belge işlendi. Kullanıcı: {}, Tür: {}, Başarılı: {}",
                yukleme.getKullanici().getId(), yukleme.getDosyaTuru(), giderler.size());
    }

    private LocalDate tarihParse(String tarihStr) {
        if (tarihStr == null || tarihStr.isBlank()) return LocalDate.now();
        for (DateTimeFormatter format : TARIH_FORMATLARI) {
            try { return LocalDate.parse(tarihStr, format); } catch (DateTimeParseException ignored) {}
        }
        try { return LocalDate.parse(tarihStr); } catch (Exception ignored) {}
        return LocalDate.now();
    }

    private BigDecimal tutarParse(String tutarStr) {
        String temiz = tutarStr.replace(",", ".").replaceAll("[^0-9.]", "");
        BigDecimal tutar = new BigDecimal(temiz);
        if (tutar.compareTo(BigDecimal.ZERO) <= 0) throw new IllegalArgumentException("Geçersiz tutar: " + tutarStr);
        return tutar;
    }

    private OdemeYontemi odemeYontemiParse(String deger) {
        if (deger == null || deger.isEmpty()) return OdemeYontemi.NAKIT;
        String norm = normalles(deger);
        if (norm.contains("kredi") || norm.contains("credit")) return OdemeYontemi.KREDI_KARTI;
        if (norm.contains("banka") || norm.contains("debit")) return OdemeYontemi.BANKA_KARTI;
        if (norm.contains("havale") || norm.contains("eft") || norm.contains("transfer")) return OdemeYontemi.HAVALE;
        try { return OdemeYontemi.valueOf(deger.toUpperCase()); } catch (IllegalArgumentException e) { return OdemeYontemi.NAKIT; }
    }

    private String normalles(String s) {
        return s.toLowerCase()
                .replace("ı", "i").replace("ğ", "g").replace("ş", "s")
                .replace("ç", "c").replace("ö", "o").replace("ü", "u");
    }

    private BelgeYuklemeResponse entitydenResponse(BelgeYukleme yukleme) {
        return new BelgeYuklemeResponse(
                yukleme.getId(),
                yukleme.getDosyaAdi(),
                yukleme.getDosyaTuru(),
                yukleme.getDurum(),
                yukleme.getToplamSatir() != null ? yukleme.getToplamSatir() : 0,
                yukleme.getIslenenSatir() != null ? yukleme.getIslenenSatir() : 0,
                yukleme.getHataMesaji(),
                yukleme.getCreatedAt()
        );
    }
}
