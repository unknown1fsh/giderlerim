package com.scinar.giderlerim.service.impl;

import com.scinar.giderlerim.util.AiIzinKapisi;
import com.scinar.giderlerim.util.EmailDogrulamaKapisi;
import com.scinar.giderlerim.util.IceAktarmaAyristirici;
import com.scinar.giderlerim.util.IceAktarmaOzeti;
import com.scinar.giderlerim.util.PiiMaskeleyici;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvException;
import com.scinar.giderlerim.config.OpenAiConfig;
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
import com.scinar.giderlerim.service.PlanKotaService;
import com.scinar.giderlerim.service.SistemParametresiDegerService;
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

    private static final String OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

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
    private final OpenAiConfig openAiConfig;
    private final RestTemplate restTemplate;
    private final SistemParametresiDegerService parametreler;
    private final PlanKotaService planKotaService;

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

        int maxDosyaBoyutuMb = parametreler.pozitifTamSayi("max.dosya.boyutu.mb", 15);
        if (dosya.getSize() > maxDosyaBoyutuMb * 1024L * 1024L) {
            throw new GecersizDosyaException("Dosya boyutu " + maxDosyaBoyutuMb + "MB'ı aşamaz.");
        }

        Kullanici kullanici = kullaniciRepository.findById(kullaniciId)
                .orElseThrow(() -> new KayitBulunamadiException("Kullanıcı bulunamadı."));

        EmailDogrulamaKapisi.dogrula(kullanici);
        if (!kullanici.getPlan().enAz(PlanTuru.PREMIUM)) {
            throw new PlanLimitiAsimException("Belge yükleme özelliği Premium veya Ultra plana dahildir.");
        }
        if ("PDF".equals(dosyaTuru) || "GORUNTU".equals(dosyaTuru)) {
            // PDF metni ve görseller yapay zeka sağlayıcısına gönderilir; açık rıza gerekir.
            AiIzinKapisi.dogrula(kullanici);
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

    private void csvIsle(BelgeYukleme yukleme, MultipartFile dosya, Kullanici kullanici) throws IOException {
        tabloIsle(yukleme, IceAktarmaAyristirici.csvOku(dosya.getBytes()), kullanici);
    }

    private void xlsxIsle(BelgeYukleme yukleme, MultipartFile dosya, Kullanici kullanici) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(dosya.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            if (sheet == null || sheet.getPhysicalNumberOfRows() < 2) {
                throw new GecersizDosyaException("XLSX dosyası boş veya yeterli veri içermiyor.");
            }
            DataFormatter formatter = new DataFormatter(java.util.Locale.forLanguageTag("tr-TR"));
            List<List<String>> satirlar = new ArrayList<>();
            int sutunSayisi = 0;
            for (int rowIdx = sheet.getFirstRowNum(); rowIdx <= sheet.getLastRowNum(); rowIdx++) {
                Row satir = sheet.getRow(rowIdx);
                if (satir == null) continue;
                sutunSayisi = Math.max(sutunSayisi, satir.getLastCellNum());
                List<String> hucreler = new ArrayList<>();
                for (int c = 0; c < Math.max(satir.getLastCellNum(), 0); c++) {
                    hucreler.add(hucreMetni(satir.getCell(c), formatter));
                }
                if (hucreler.stream().anyMatch(h -> !h.isBlank())) {
                    satirlar.add(hucreler);
                }
            }
            if (satirlar.size() < 2) {
                throw new GecersizDosyaException("XLSX dosyası boş veya yeterli veri içermiyor.");
            }
            tabloIsle(yukleme, new IceAktarmaAyristirici.HamTablo(satirlar.get(0), satirlar.subList(1, satirlar.size())), kullanici);
        }
    }

    /** Tarih hücrelerini ISO biçiminde, sayıları ondalık noktalı ham değerle, diğerlerini görüntülendiği gibi okur. */
    private static String hucreMetni(Cell hucre, DataFormatter formatter) {
        if (hucre == null) return "";
        if (hucre.getCellType() == CellType.NUMERIC) {
            if (DateUtil.isCellDateFormatted(hucre)) {
                return hucre.getLocalDateTimeCellValue().toLocalDate().toString();
            }
            return BigDecimal.valueOf(hucre.getNumericCellValue()).toPlainString();
        }
        return formatter.formatCellValue(hucre).trim();
    }

    private void tabloIsle(BelgeYukleme yukleme, IceAktarmaAyristirici.HamTablo tablo, Kullanici kullanici) {
        Kategori varsayilanKategori = varsayilanKategoriGetir(kullanici);
        IceAktarmaAyristirici.Sonuc sonuc = IceAktarmaAyristirici.ayristir(tablo);
        int eklenecek = planKotaService.iceAktarilabilir(kullanici, sonuc.giderler().size());
        int limitNedeniyleEklenmeyen = sonuc.giderler().size() - eklenecek;
        List<Gider> giderler = sonuc.giderler().stream()
                .limit(eklenecek)
                .map(s -> giderOlustur(kullanici, varsayilanKategori, yukleme, s.tutar(), s.aciklama(), s.tarih(), s.odemeYontemi()))
                .collect(Collectors.toCollection(ArrayList::new));
        if (!giderler.isEmpty()) {
            giderRepository.saveAll(giderler);
        }
        yukleme.setToplamSatir(sonuc.toplamSatir());
        yukleme.setIslenenSatir(giderler.size());
        yukleme.setDurum(giderler.isEmpty() && !sonuc.hatalar().isEmpty() ? YuklemeDurumu.HATA : YuklemeDurumu.TAMAMLANDI);
        yukleme.setHataMesaji(IceAktarmaOzeti.mesaj(sonuc, limitNedeniyleEklenmeyen));
        belgeYuklemeRepository.save(yukleme);
        log.info("Belge tablosu işlendi. Kullanıcı: {}, Tür: {}, Eklenen: {}, Atlanan: {}, Hatalı: {}",
                kullanici.getId(), yukleme.getDosyaTuru(), giderler.size(), sonuc.atlananSayisi(), sonuc.hatalar().size());
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

        String kategoriListesi = kategoriListesiHazirla(kullanici);

        String prompt = """
                Aşağıdaki metin bir banka ekstresi, makbuz veya harcama belgesidir.
                TÜM harcama kalemlerini JSON formatında çıkar. Sadece harcamaları listele, gelirleri dahil etme.
                Format:
                [{"tarih":"YYYY-MM-DD","tutar":0.00,"aciklama":"...","odemeYontemi":"NAKIT","kategori":"Kategori Adı"}]
                Sadece JSON dizisi döndür, başka açıklama ekleme.
                odemeYontemi değerleri: NAKIT, KREDI_KARTI, BANKA_KARTI, HAVALE, DIGER
                Tarih bulunamazsa bugünün tarihini kullan: %s
                
                Her harcama için aşağıdaki kategorilerden en uygun olanını seç:
                %s
                Eğer hiçbir kategori uygun değilse "Diğer" yaz.
                ---
                %s
                """.formatted(LocalDate.now(), kategoriListesi,
                PiiMaskeleyici.maskeleVeKisalt(pdfMetni, 8000, kullanici.getAd(), kullanici.getSoyad()));

        List<Map<String, Object>> mesajlar = List.of(
                Map.of("role", "user", "content", prompt)
        );
        String yanit = openAiApiCagir(mesajlar);
        List<Gider> giderler = jsonYanitiGiderlereCevir(yanit, kullanici, yukleme);
        yuklemeKapat(yukleme, giderler, Collections.emptyList(), giderler.size());
    }

    private void goruntIsle(BelgeYukleme yukleme, MultipartFile dosya, Kullanici kullanici)
            throws IOException {
        byte[] dosyaBytes = dosya.getInputStream().readAllBytes();
        String base64 = Base64.getEncoder().encodeToString(dosyaBytes);
        String mediaType = gorselMediaType(dosya.getOriginalFilename());
        String kategoriListesi = kategoriListesiHazirla(kullanici);

        String prompt = """
                Bu görüntü bir makbuz, fiş, banka ekstresi veya harcama belgesidir.
                Görseldeki TÜM harcama kalemlerini JSON formatında çıkar. Sadece harcamaları listele, gelirleri dahil etme.
                Format:
                [{"tarih":"YYYY-MM-DD","tutar":0.00,"aciklama":"...","odemeYontemi":"NAKIT","kategori":"Kategori Adı"}]
                Sadece JSON dizisi döndür, başka açıklama ekleme.
                odemeYontemi değerleri: NAKIT, KREDI_KARTI, BANKA_KARTI, HAVALE, DIGER
                Tarih bulunamazsa bugünün tarihini kullan: %s
                
                Her harcama için aşağıdaki kategorilerden en uygun olanını seç:
                %s
                Eğer hiçbir kategori uygun değilse "Diğer" yaz.
                """.formatted(LocalDate.now(), kategoriListesi);

        String dataUrl = "data:" + mediaType + ";base64," + base64;

        List<Map<String, Object>> icerikListesi = new ArrayList<>();
        icerikListesi.add(Map.of("type", "text", "text", prompt));
        icerikListesi.add(Map.of(
                "type", "image_url",
                "image_url", Map.of("url", dataUrl, "detail", "high")
        ));

        List<Map<String, Object>> mesajlar = List.of(
                Map.of("role", "user", "content", icerikListesi)
        );
        String yanit = openAiApiCagir(mesajlar);
        List<Gider> giderler = jsonYanitiGiderlereCevir(yanit, kullanici, yukleme);
        yuklemeKapat(yukleme, giderler, Collections.emptyList(), giderler.size());
    }

    // ========== OpenAI API ==========

    private String openAiApiCagir(List<Map<String, Object>> mesajlar) {
        HttpHeaders basliklar = new HttpHeaders();
        basliklar.setContentType(MediaType.APPLICATION_JSON);
        basliklar.setBearerAuth(openAiConfig.getApiAnahtari());

        Map<String, Object> istek = new HashMap<>();
        istek.put("model", openAiConfig.getModel());
        istek.put("max_tokens", openAiConfig.getMaxTokens());
        istek.put("messages", mesajlar);

        try {
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(istek, basliklar);
            ResponseEntity<String> yanit = restTemplate.exchange(
                    OPENAI_API_URL, HttpMethod.POST, entity, String.class
            );
            String yanitGovdesi = yanit.getBody();
            if (yanitGovdesi == null) throw new RuntimeException("API boş yanıt döndü.");

            ObjectMapper mapper = new ObjectMapper();
            JsonNode node = mapper.readTree(yanitGovdesi);
            return node.path("choices").get(0).path("message").path("content").asText();
        } catch (Exception e) {
            log.error("OpenAI API çağrısı başarısız: {}", e.getMessage());
            throw new RuntimeException("Yapay zeka servisi şu an kullanılamıyor.");
        }
    }

    private List<Gider> jsonYanitiGiderlereCevir(String yanit, Kullanici kullanici, BelgeYukleme yukleme) {
        Kategori varsayilanKategori = varsayilanKategoriGetir(kullanici);
        List<Kategori> kullaniciKategorileri = kategoriRepository.findAllByKullaniciId(kullanici.getId());
        List<Gider> giderler = new ArrayList<>();

        try {
            String temizYanit = yanit.trim();
            int baslangic = temizYanit.indexOf('[');
            int bitis = temizYanit.lastIndexOf(']');
            if (baslangic == -1 || bitis == -1) {
                log.warn("AI yanıtında JSON dizisi bulunamadı (uzunluk={})", temizYanit.length());
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
                    String kategoriAdi = item.path("kategori").asText(null);

                    Kategori eslesenKategori = kategoriEslestir(kategoriAdi, kullaniciKategorileri, varsayilanKategori);
                    boolean aiKategorilendi = eslesenKategori != varsayilanKategori && kategoriAdi != null;

                    if (tutar.compareTo(BigDecimal.ZERO) > 0) {
                        giderler.add(giderOlusturWithKategori(kullanici, eslesenKategori, yukleme,
                                tutar, aciklama, tarih, odemeYontemi, aiKategorilendi));
                    }
                } catch (Exception e) {
                    log.debug("JSON item parse hatası: {}", e.getMessage());
                }
            }
        } catch (Exception e) {
            log.error("AI yanıtı parse hatası: {}", e.getMessage());
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

    private String kategoriListesiHazirla(Kullanici kullanici) {
        List<Kategori> kategoriler = kategoriRepository.findAllByKullaniciId(kullanici.getId());
        return kategoriler.stream()
                .map(k -> k.getAd())
                .collect(Collectors.joining(", "));
    }

    private Kategori kategoriEslestir(String kategoriAdi, List<Kategori> kategoriler, Kategori varsayilan) {
        if (kategoriAdi == null || kategoriAdi.isBlank()) return varsayilan;

        String normAd = normalles(kategoriAdi.trim());

        for (Kategori k : kategoriler) {
            if (normalles(k.getAd()).equals(normAd)) return k;
        }

        for (Kategori k : kategoriler) {
            String normKatAd = normalles(k.getAd());
            if (normKatAd.contains(normAd) || normAd.contains(normKatAd)) return k;
        }

        return varsayilan;
    }

    private Gider giderOlusturWithKategori(Kullanici kullanici, Kategori kategori, BelgeYukleme yukleme,
                                            BigDecimal tutar, String aciklama, LocalDate tarih,
                                            OdemeYontemi odemeYontemi, boolean aiKategorilendi) {
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
                .aiKategorilendi(aiKategorilendi)
                .anormalMi(false)
                .build();
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
