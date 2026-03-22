package com.scinar.giderlerim.service.impl;

import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvException;
import com.scinar.giderlerim.dto.response.ApiResponse;
import com.scinar.giderlerim.dto.response.CsvYuklemeResponse;
import com.scinar.giderlerim.entity.CsvYukleme;
import com.scinar.giderlerim.entity.Gider;
import com.scinar.giderlerim.entity.Kategori;
import com.scinar.giderlerim.entity.Kullanici;
import com.scinar.giderlerim.entity.enums.GirisTuru;
import com.scinar.giderlerim.entity.enums.OdemeYontemi;
import com.scinar.giderlerim.entity.enums.ParaBirimi;
import com.scinar.giderlerim.entity.enums.YuklemeDurumu;
import com.scinar.giderlerim.exception.GecersizDosyaException;
import com.scinar.giderlerim.exception.KayitBulunamadiException;
import com.scinar.giderlerim.repository.CsvYuklemeRepository;
import com.scinar.giderlerim.repository.GiderRepository;
import com.scinar.giderlerim.repository.KategoriRepository;
import com.scinar.giderlerim.repository.KullaniciRepository;
import com.scinar.giderlerim.service.CsvYuklemeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CsvYuklemeServiceImpl implements CsvYuklemeService {

    private static final long MAX_DOSYA_BOYUTU = 5 * 1024 * 1024; // 5MB
    private static final List<DateTimeFormatter> TARIH_FORMATLARI = List.of(
            DateTimeFormatter.ofPattern("dd/MM/yyyy"),
            DateTimeFormatter.ofPattern("dd.MM.yyyy"),
            DateTimeFormatter.ofPattern("yyyy-MM-dd"),
            DateTimeFormatter.ofPattern("d/M/yyyy"),
            DateTimeFormatter.ofPattern("d.M.yyyy")
    );

    private final CsvYuklemeRepository csvYuklemeRepository;
    private final GiderRepository giderRepository;
    private final KullaniciRepository kullaniciRepository;
    private final KategoriRepository kategoriRepository;

    @Override
    @Transactional
    public ApiResponse<CsvYuklemeResponse> dosyaYukle(Long kullaniciId, MultipartFile dosya) {
        // Dosya doğrulama
        if (dosya == null || dosya.isEmpty()) {
            throw new GecersizDosyaException("Dosya boş veya seçilmemiş.");
        }

        String dosyaAdi = dosya.getOriginalFilename();
        if (dosyaAdi == null || !dosyaAdi.toLowerCase().endsWith(".csv")) {
            throw new GecersizDosyaException("Yalnızca CSV dosyaları desteklenmektedir.");
        }

        if (dosya.getSize() > MAX_DOSYA_BOYUTU) {
            throw new GecersizDosyaException("Dosya boyutu 5MB'ı aşamaz.");
        }

        Kullanici kullanici = kullaniciRepository.findById(kullaniciId)
                .orElseThrow(() -> new KayitBulunamadiException("Kullanıcı bulunamadı."));

        // Yükleme kaydı oluştur
        CsvYukleme yukleme = CsvYukleme.builder()
                .kullanici(kullanici)
                .dosyaAdi(dosyaAdi)
                .durum(YuklemeDurumu.ISLENIYOR)
                .toplamSatir(0)
                .islenenSatir(0)
                .build();
        CsvYukleme kaydedilenYukleme = csvYuklemeRepository.save(yukleme);

        try {
            // CSV işle
            csvIsle(kaydedilenYukleme, dosya, kullanici);
            return ApiResponse.basarili("CSV dosyası başarıyla işlendi.", entitydenResponse(kaydedilenYukleme));
        } catch (Exception e) {
            kaydedilenYukleme.setDurum(YuklemeDurumu.HATA);
            kaydedilenYukleme.setHataMesaji(e.getMessage());
            csvYuklemeRepository.save(kaydedilenYukleme);
            log.error("CSV işleme hatası. Kullanıcı: {}, Dosya: {}", kullaniciId, dosyaAdi, e);
            throw new GecersizDosyaException("CSV dosyası işlenirken hata oluştu: " + e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<CsvYuklemeResponse> durumSorgula(Long kullaniciId, Long yuklemeId) {
        CsvYukleme yukleme = csvYuklemeRepository.findByIdAndKullaniciId(yuklemeId, kullaniciId)
                .orElseThrow(() -> new KayitBulunamadiException("Yükleme kaydı bulunamadı. ID: " + yuklemeId));
        return ApiResponse.basarili(entitydenResponse(yukleme));
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<CsvYuklemeResponse>> gecmis(Long kullaniciId) {
        List<CsvYuklemeResponse> gecmis = csvYuklemeRepository
                .findByKullaniciIdOrderByCreatedAtDesc(kullaniciId)
                .stream()
                .map(this::entitydenResponse)
                .collect(Collectors.toList());
        return ApiResponse.basarili(gecmis);
    }

    // ========== Yardımcı Metodlar ==========

    private void csvIsle(CsvYukleme yukleme, MultipartFile dosya, Kullanici kullanici)
            throws IOException, CsvException {

        // Varsayılan kategori: Diğer
        Kategori varsayilanKategori = kategoriRepository.findAllByKullaniciId(kullanici.getId())
                .stream()
                .filter(k -> Boolean.TRUE.equals(k.getSistemMi()) && k.getAd().contains("Diğer"))
                .findFirst()
                .orElseGet(() -> kategoriRepository.findAllByKullaniciId(kullanici.getId())
                        .stream()
                        .filter(k -> Boolean.TRUE.equals(k.getSistemMi()))
                        .findFirst()
                        .orElseThrow(() -> new KayitBulunamadiException("Sistem kategorisi bulunamadı.")));

        try (CSVReader csvReader = new CSVReader(
                new InputStreamReader(dosya.getInputStream(), StandardCharsets.UTF_8))) {

            List<String[]> satirlar = csvReader.readAll();

            if (satirlar.isEmpty()) {
                throw new GecersizDosyaException("CSV dosyası boş.");
            }

            // Başlık satırını atla
            String[] baslik = satirlar.get(0);
            int toplamSatir = satirlar.size() - 1;

            yukleme.setToplamSatir(toplamSatir);
            csvYuklemeRepository.save(yukleme);

            // Sütun indekslerini belirle
            int tarihIndex = -1, aciklamaIndex = -1, tutarIndex = -1, odemeYontemiIndex = -1;

            for (int i = 0; i < baslik.length; i++) {
                String sutun = baslik[i].trim().toLowerCase()
                        .replace("ı", "i").replace("ğ", "g").replace("ş", "s")
                        .replace("ç", "c").replace("ö", "o").replace("ü", "u");
                switch (sutun) {
                    case "tarih", "date" -> tarihIndex = i;
                    case "aciklama", "açıklama", "description", "islem", "işlem" -> aciklamaIndex = i;
                    case "tutar", "miktar", "amount" -> tutarIndex = i;
                    case "odeme_yontemi", "ödeme_yöntemi", "payment_method", "odeme" -> odemeYontemiIndex = i;
                }
            }

            if (tarihIndex == -1 || tutarIndex == -1) {
                throw new GecersizDosyaException(
                        "CSV dosyası gerekli sütunları içermiyor. Gerekli: tarih, tutar. " +
                        "Opsiyonel: aciklama, odeme_yontemi"
                );
            }

            List<Gider> islenecekGiderler = new ArrayList<>();
            int islenenSatir = 0;
            List<String> hatalar = new ArrayList<>();

            for (int i = 1; i < satirlar.size(); i++) {
                String[] satir = satirlar.get(i);
                try {
                    if (satir.length <= Math.max(tarihIndex, tutarIndex)) {
                        hatalar.add("Satır " + i + ": Eksik sütun");
                        continue;
                    }

                    // Tarih parse
                    LocalDate tarih = tarihParse(satir[tarihIndex].trim());

                    // Tutar parse
                    String tutarStr = satir[tutarIndex].trim()
                            .replace(",", ".")
                            .replaceAll("[^0-9.]", "");
                    BigDecimal tutar = new BigDecimal(tutarStr);

                    if (tutar.compareTo(BigDecimal.ZERO) <= 0) {
                        hatalar.add("Satır " + i + ": Geçersiz tutar");
                        continue;
                    }

                    // Açıklama
                    String aciklama = null;
                    if (aciklamaIndex >= 0 && aciklamaIndex < satir.length) {
                        aciklama = satir[aciklamaIndex].trim();
                        if (aciklama.isEmpty()) aciklama = null;
                    }

                    // Ödeme yöntemi
                    OdemeYontemi odemeYontemi = OdemeYontemi.NAKIT;
                    if (odemeYontemiIndex >= 0 && odemeYontemiIndex < satir.length) {
                        odemeYontemi = odemeYontemiParse(satir[odemeYontemiIndex].trim());
                    }

                    Gider gider = Gider.builder()
                            .kullanici(kullanici)
                            .kategori(varsayilanKategori)
                            .tutar(tutar)
                            .paraBirimi(ParaBirimi.TRY)
                            .aciklama(aciklama)
                            .tarih(tarih)
                            .odemeYontemi(odemeYontemi)
                            .girisTuru(GirisTuru.CSV)
                            .csvYukleme(yukleme)
                            .aiKategorilendi(false)
                            .anormalMi(false)
                            .build();

                    islenecekGiderler.add(gider);
                    islenenSatir++;

                } catch (Exception e) {
                    hatalar.add("Satır " + i + ": " + e.getMessage());
                    log.debug("CSV satır işleme hatası, satır {}: {}", i, e.getMessage());
                }
            }

            // Toplu kaydet
            if (!islenecekGiderler.isEmpty()) {
                giderRepository.saveAll(islenecekGiderler);
            }

            yukleme.setIslenenSatir(islenenSatir);

            if (!hatalar.isEmpty() && islenenSatir == 0) {
                yukleme.setDurum(YuklemeDurumu.HATA);
                yukleme.setHataMesaji("Tüm satırlarda hata oluştu: " + String.join("; ", hatalar.subList(0, Math.min(5, hatalar.size()))));
            } else if (!hatalar.isEmpty()) {
                yukleme.setDurum(YuklemeDurumu.TAMAMLANDI);
                yukleme.setHataMesaji(hatalar.size() + " satır işlenemedi.");
            } else {
                yukleme.setDurum(YuklemeDurumu.TAMAMLANDI);
            }

            csvYuklemeRepository.save(yukleme);
            log.info("CSV işlendi. Kullanıcı: {}, Toplam: {}, Başarılı: {}, Hatalı: {}",
                    kullanici.getId(), toplamSatir, islenenSatir, hatalar.size());
        }
    }

    private LocalDate tarihParse(String tarihStr) {
        for (DateTimeFormatter format : TARIH_FORMATLARI) {
            try {
                return LocalDate.parse(tarihStr, format);
            } catch (DateTimeParseException e) {
                // Sonraki formatı dene
            }
        }
        throw new IllegalArgumentException("Tarih formatı tanınamadı: " + tarihStr);
    }

    private OdemeYontemi odemeYontemiParse(String deger) {
        if (deger == null || deger.isEmpty()) return OdemeYontemi.NAKIT;

        String normallestirilmis = deger.toLowerCase()
                .replace("ı", "i").replace("ğ", "g")
                .replace("ş", "s").replace("ç", "c")
                .replace("ö", "o").replace("ü", "u");

        if (normallestirilmis.contains("kredi") || normallestirilmis.contains("credit")) {
            return OdemeYontemi.KREDI_KARTI;
        }
        if (normallestirilmis.contains("banka") || normallestirilmis.contains("debit")) {
            return OdemeYontemi.BANKA_KARTI;
        }
        if (normallestirilmis.contains("havale") || normallestirilmis.contains("eft") || normallestirilmis.contains("transfer")) {
            return OdemeYontemi.HAVALE;
        }

        try {
            return OdemeYontemi.valueOf(deger.toUpperCase());
        } catch (IllegalArgumentException e) {
            return OdemeYontemi.NAKIT;
        }
    }

    private CsvYuklemeResponse entitydenResponse(CsvYukleme yukleme) {
        return new CsvYuklemeResponse(
                yukleme.getId(),
                yukleme.getDosyaAdi(),
                yukleme.getDurum(),
                yukleme.getToplamSatir() != null ? yukleme.getToplamSatir() : 0,
                yukleme.getIslenenSatir() != null ? yukleme.getIslenenSatir() : 0,
                yukleme.getHataMesaji(),
                yukleme.getCreatedAt()
        );
    }
}
