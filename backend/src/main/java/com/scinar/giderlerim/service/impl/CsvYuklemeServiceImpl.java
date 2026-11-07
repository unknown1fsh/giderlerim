package com.scinar.giderlerim.service.impl;

import com.scinar.giderlerim.dto.response.ApiResponse;
import com.scinar.giderlerim.dto.response.CsvYuklemeResponse;
import com.scinar.giderlerim.entity.CsvYukleme;
import com.scinar.giderlerim.entity.Gider;
import com.scinar.giderlerim.entity.Kategori;
import com.scinar.giderlerim.entity.Kullanici;
import com.scinar.giderlerim.entity.enums.GirisTuru;
import com.scinar.giderlerim.entity.enums.ParaBirimi;
import com.scinar.giderlerim.entity.enums.YuklemeDurumu;
import com.scinar.giderlerim.entity.enums.PlanTuru;
import com.scinar.giderlerim.exception.GecersizDosyaException;
import com.scinar.giderlerim.exception.KayitBulunamadiException;
import com.scinar.giderlerim.exception.PlanLimitiAsimException;
import com.scinar.giderlerim.repository.CsvYuklemeRepository;
import com.scinar.giderlerim.repository.GiderRepository;
import com.scinar.giderlerim.repository.KategoriRepository;
import com.scinar.giderlerim.repository.KullaniciRepository;
import com.scinar.giderlerim.service.CsvYuklemeService;
import com.scinar.giderlerim.service.PlanKotaService;
import com.scinar.giderlerim.util.EmailDogrulamaKapisi;
import com.scinar.giderlerim.util.IceAktarmaAyristirici;
import com.scinar.giderlerim.util.IceAktarmaOzeti;
import com.scinar.giderlerim.service.SistemParametresiDegerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CsvYuklemeServiceImpl implements CsvYuklemeService {

    private final CsvYuklemeRepository csvYuklemeRepository;
    private final GiderRepository giderRepository;
    private final KullaniciRepository kullaniciRepository;
    private final KategoriRepository kategoriRepository;
    private final SistemParametresiDegerService parametreler;
    private final PlanKotaService planKotaService;

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

        int maxDosyaBoyutuMb = parametreler.pozitifTamSayi("max.dosya.boyutu.mb", 15);
        if (dosya.getSize() > maxDosyaBoyutuMb * 1024L * 1024L) {
            throw new GecersizDosyaException("Dosya boyutu " + maxDosyaBoyutuMb + "MB'ı aşamaz.");
        }

        Kullanici kullanici = kullaniciRepository.findById(kullaniciId)
                .orElseThrow(() -> new KayitBulunamadiException("Kullanıcı bulunamadı."));
        EmailDogrulamaKapisi.dogrula(kullanici);

        // Plan kontrolü: FREE kullanıcılar aylık 1 CSV yükleyebilir
        if (kullanici.getPlan() == PlanTuru.FREE) {
            int ay = LocalDate.now().getMonthValue();
            int yil = LocalDate.now().getYear();
            long aylikYukleme = csvYuklemeRepository.countByKullaniciIdAndAyAndYil(kullaniciId, ay, yil);
            if (aylikYukleme >= 1) {
                throw new PlanLimitiAsimException(
                        "Ücretsiz planda aylık 1 CSV yükleme hakkınız bulunmaktadır. " +
                        "PREMIUM'a geçerek sınırsız yükleme yapabilirsiniz."
                );
            }
        } else if (kullanici.getPlan() == PlanTuru.PREMIUM) {
            int aylikLimit = parametreler.tamSayi("premium.csv.yukleme.limiti", -1);
            if (aylikLimit >= 0) {
                int ay = LocalDate.now().getMonthValue();
                int yil = LocalDate.now().getYear();
                long aylikYukleme = csvYuklemeRepository.countByKullaniciIdAndAyAndYil(kullaniciId, ay, yil);
                if (aylikYukleme >= aylikLimit) {
                    throw new PlanLimitiAsimException(
                            "Pro planda aylık " + aylikLimit + " CSV yükleme hakkınız bulunmaktadır."
                    );
                }
            }
        }

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
        } catch (PlanLimitiAsimException e) {
            throw e;
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

    private void csvIsle(CsvYukleme yukleme, MultipartFile dosya, Kullanici kullanici) throws IOException {
        Kategori varsayilanKategori = kategoriRepository.findAllByKullaniciId(kullanici.getId())
                .stream()
                .filter(k -> Boolean.TRUE.equals(k.getSistemMi()) && k.getAd().contains("Diğer"))
                .findFirst()
                .orElseGet(() -> kategoriRepository.findAllByKullaniciId(kullanici.getId())
                        .stream()
                        .filter(k -> Boolean.TRUE.equals(k.getSistemMi()))
                        .findFirst()
                        .orElseThrow(() -> new KayitBulunamadiException("Sistem kategorisi bulunamadı.")));

        IceAktarmaAyristirici.Sonuc sonuc = IceAktarmaAyristirici.ayristir(IceAktarmaAyristirici.csvOku(dosya.getBytes()));
        yukleme.setToplamSatir(sonuc.toplamSatir());

        // Ücretsiz planda aylık gider hakkı içe aktarmada da geçerlidir; kalan hak kadar satır eklenir.
        if (!sonuc.giderler().isEmpty()) {
            planKotaService.giderEklemeKontrol(kullanici, 1);
        }
        int eklenecek = planKotaService.iceAktarilabilir(kullanici, sonuc.giderler().size());
        int limitNedeniyleEklenmeyen = sonuc.giderler().size() - eklenecek;

        List<Gider> giderler = sonuc.giderler().stream()
                .limit(eklenecek)
                .map(satir -> Gider.builder()
                        .kullanici(kullanici)
                        .kategori(varsayilanKategori)
                        .tutar(satir.tutar())
                        .paraBirimi(ParaBirimi.TRY)
                        .aciklama(satir.aciklama())
                        .tarih(satir.tarih())
                        .odemeYontemi(satir.odemeYontemi())
                        .girisTuru(GirisTuru.CSV)
                        .csvYukleme(yukleme)
                        .aiKategorilendi(false)
                        .anormalMi(false)
                        .build())
                .toList();
        if (!giderler.isEmpty()) {
            giderRepository.saveAll(giderler);
        }
        yukleme.setIslenenSatir(giderler.size());
        yukleme.setDurum(giderler.isEmpty() && !sonuc.hatalar().isEmpty() ? YuklemeDurumu.HATA : YuklemeDurumu.TAMAMLANDI);
        yukleme.setHataMesaji(IceAktarmaOzeti.mesaj(sonuc, limitNedeniyleEklenmeyen));
        csvYuklemeRepository.save(yukleme);
        log.info("CSV işlendi. Kullanıcı: {}, Toplam: {}, Eklenen: {}, Atlanan: {}, Hatalı: {}",
                kullanici.getId(), sonuc.toplamSatir(), giderler.size(), sonuc.atlananSayisi(), sonuc.hatalar().size());
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
