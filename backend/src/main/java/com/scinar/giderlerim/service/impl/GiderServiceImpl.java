package com.scinar.giderlerim.service.impl;

import com.scinar.giderlerim.dto.request.GiderGuncelleRequest;
import com.scinar.giderlerim.dto.request.GiderOlusturRequest;
import com.scinar.giderlerim.dto.response.ApiResponse;
import com.scinar.giderlerim.dto.response.GiderResponse;
import com.scinar.giderlerim.dto.response.KategoriResponse;
import com.scinar.giderlerim.dto.response.SayfaliResponse;
import com.scinar.giderlerim.entity.Gider;
import com.scinar.giderlerim.entity.Kategori;
import com.scinar.giderlerim.entity.Kullanici;
import com.scinar.giderlerim.entity.enums.GirisTuru;
import com.scinar.giderlerim.entity.enums.OdemeYontemi;
import com.scinar.giderlerim.entity.enums.ParaBirimi;
import com.scinar.giderlerim.entity.enums.PlanTuru;
import com.scinar.giderlerim.exception.KayitBulunamadiException;
import com.scinar.giderlerim.exception.PlanLimitiAsimException;
import com.scinar.giderlerim.repository.GiderRepository;
import com.scinar.giderlerim.repository.KategoriRepository;
import com.scinar.giderlerim.repository.KullaniciRepository;
import com.scinar.giderlerim.service.GiderService;
import com.scinar.giderlerim.service.UyariService;
import com.scinar.giderlerim.util.TarihYardimcisi;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class GiderServiceImpl implements GiderService {

    private final GiderRepository giderRepository;
    private final KategoriRepository kategoriRepository;
    private final KullaniciRepository kullaniciRepository;
    private final UyariService uyariService;

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<SayfaliResponse<GiderResponse>> listele(
            Long kullaniciId, Long kategoriId, LocalDate baslangic, LocalDate bitis,
            OdemeYontemi odemeYontemi, int page, int size) {

        PageRequest sayfaIstegi = PageRequest.of(page, size);
        Page<Gider> giderSayfasi;

        // Filtre parametrelerinden herhangi biri varsa filtreli sorgu kullan
        if (kategoriId != null || baslangic != null || bitis != null || odemeYontemi != null) {
            giderSayfasi = giderRepository.findFiltreli(
                    kullaniciId, kategoriId, baslangic, bitis, odemeYontemi, sayfaIstegi
            );
        } else {
            giderSayfasi = giderRepository.findByKullaniciIdAndDeletedAtIsNull(kullaniciId, sayfaIstegi);
        }

        List<GiderResponse> giderler = giderSayfasi.getContent().stream()
                .map(this::entitydenResponse)
                .collect(Collectors.toList());

        SayfaliResponse<GiderResponse> sayfaliSonuc = new SayfaliResponse<>(
                giderler,
                giderSayfasi.getNumber(),
                giderSayfasi.getSize(),
                giderSayfasi.getTotalElements(),
                giderSayfasi.getTotalPages(),
                giderSayfasi.isLast()
        );

        return ApiResponse.basarili(sayfaliSonuc);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<GiderResponse> getById(Long kullaniciId, Long giderId) {
        Gider gider = giderRepository.findByIdAndKullaniciIdAndDeletedAtIsNull(giderId, kullaniciId)
                .orElseThrow(() -> new KayitBulunamadiException("Gider bulunamadı. ID: " + giderId));
        return ApiResponse.basarili(entitydenResponse(gider));
    }

    @Override
    @Transactional
    public ApiResponse<GiderResponse> olustur(Long kullaniciId, GiderOlusturRequest request) {
        Kullanici kullanici = kullaniciRepository.findById(kullaniciId)
                .orElseThrow(() -> new KayitBulunamadiException("Kullanıcı bulunamadı."));

        // FREE plan: aylık 50 gider limiti
        if (kullanici.getPlan() == PlanTuru.FREE) {
            int ay = request.tarih().getMonthValue();
            int yil = request.tarih().getYear();
            long aylikGiderSayisi = giderRepository.countByKullaniciIdAndAyAndYil(kullaniciId, ay, yil);
            if (aylikGiderSayisi >= 50) {
                throw new PlanLimitiAsimException(
                        "Ücretsiz planda aylık 50 gider girişi hakkınız bulunmaktadır. " +
                        "PREMIUM'a geçerek sınırsız gider ekleyebilirsiniz."
                );
            }
        }

        Kategori kategori = kategoriRepository
                .findByIdAndKullaniciIdOrSistemMi(request.kategoriId(), kullaniciId)
                .orElseThrow(() -> new KayitBulunamadiException("Kategori bulunamadı. ID: " + request.kategoriId()));

        Gider yeniGider = Gider.builder()
                .kullanici(kullanici)
                .kategori(kategori)
                .tutar(request.tutar())
                .paraBirimi(request.paraBirimi() != null ? request.paraBirimi() : ParaBirimi.TRY)
                .aciklama(request.aciklama())
                .notlar(request.notlar())
                .tarih(request.tarih())
                .odemeYontemi(request.odemeYontemi() != null ? request.odemeYontemi() : OdemeYontemi.NAKIT)
                .girisTuru(GirisTuru.MANUEL)
                .aiKategorilendi(false)
                .anormalMi(false)
                .build();

        Gider kaydedilen = giderRepository.save(yeniGider);
        log.debug("Yeni gider oluşturuldu. ID: {}, Kullanıcı: {}", kaydedilen.getId(), kullaniciId);

        // Bütçe kontrolü yap
        int ay = request.tarih().getMonthValue();
        int yil = request.tarih().getYear();
        try {
            uyariService.butceKontrolEt(kullaniciId, kategori.getId(), ay, yil);
        } catch (Exception e) {
            log.warn("Bütçe kontrolü sırasında hata oluştu: {}", e.getMessage());
        }

        return ApiResponse.basarili("Gider başarıyla eklendi.", entitydenResponse(kaydedilen));
    }

    @Override
    @Transactional
    public ApiResponse<GiderResponse> guncelle(Long kullaniciId, Long giderId, GiderGuncelleRequest request) {
        Gider gider = giderRepository.findByIdAndKullaniciIdAndDeletedAtIsNull(giderId, kullaniciId)
                .orElseThrow(() -> new KayitBulunamadiException("Gider bulunamadı. ID: " + giderId));

        if (request.kategoriId() != null) {
            Kategori kategori = kategoriRepository
                    .findByIdAndKullaniciIdOrSistemMi(request.kategoriId(), kullaniciId)
                    .orElseThrow(() -> new KayitBulunamadiException("Kategori bulunamadı. ID: " + request.kategoriId()));
            gider.setKategori(kategori);
        }

        if (request.tutar() != null) {
            gider.setTutar(request.tutar());
        }
        if (request.paraBirimi() != null) {
            gider.setParaBirimi(request.paraBirimi());
        }
        if (request.aciklama() != null) {
            gider.setAciklama(request.aciklama());
        }
        if (request.notlar() != null) {
            gider.setNotlar(request.notlar());
        }
        if (request.tarih() != null) {
            gider.setTarih(request.tarih());
        }
        if (request.odemeYontemi() != null) {
            gider.setOdemeYontemi(request.odemeYontemi());
        }

        Gider guncellenen = giderRepository.save(gider);
        log.debug("Gider güncellendi. ID: {}, Kullanıcı: {}", giderId, kullaniciId);

        return ApiResponse.basarili("Gider başarıyla güncellendi.", entitydenResponse(guncellenen));
    }

    @Override
    @Transactional
    public ApiResponse<Void> sil(Long kullaniciId, Long giderId) {
        Gider gider = giderRepository.findByIdAndKullaniciIdAndDeletedAtIsNull(giderId, kullaniciId)
                .orElseThrow(() -> new KayitBulunamadiException("Gider bulunamadı. ID: " + giderId));

        gider.setDeletedAt(LocalDateTime.now());
        giderRepository.save(gider);

        log.debug("Gider silindi. ID: {}, Kullanıcı: {}", giderId, kullaniciId);
        return ApiResponse.basarili("Gider başarıyla silindi.", null);
    }

    public GiderResponse entitydenResponse(Gider gider) {
        KategoriResponse kategoriResponse = new KategoriResponse(
                gider.getKategori().getId(),
                gider.getKategori().getAd(),
                gider.getKategori().getIkon(),
                gider.getKategori().getRenk(),
                Boolean.TRUE.equals(gider.getKategori().getSistemMi())
        );

        return new GiderResponse(
                gider.getId(),
                kategoriResponse,
                gider.getTutar(),
                gider.getParaBirimi(),
                gider.getAciklama(),
                gider.getNotlar(),
                gider.getTarih(),
                gider.getOdemeYontemi(),
                gider.getGirisTuru(),
                Boolean.TRUE.equals(gider.getAiKategorilendi()),
                Boolean.TRUE.equals(gider.getAnormalMi()),
                gider.getCreatedAt()
        );
    }
}
