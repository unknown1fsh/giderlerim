package com.scinar.giderlerim.service.impl;

import com.scinar.giderlerim.dto.response.ApiResponse;
import com.scinar.giderlerim.dto.response.SayfaliResponse;
import com.scinar.giderlerim.dto.response.UyariResponse;
import com.scinar.giderlerim.entity.Butce;
import com.scinar.giderlerim.entity.Kullanici;
import com.scinar.giderlerim.entity.Uyari;
import com.scinar.giderlerim.entity.enums.UyariTuru;
import com.scinar.giderlerim.exception.KayitBulunamadiException;
import com.scinar.giderlerim.repository.ButceRepository;
import com.scinar.giderlerim.repository.GiderRepository;
import com.scinar.giderlerim.repository.KullaniciRepository;
import com.scinar.giderlerim.repository.UyariRepository;
import com.scinar.giderlerim.service.UyariService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UyariServiceImpl implements UyariService {

    private final UyariRepository uyariRepository;
    private final ButceRepository butceRepository;
    private final GiderRepository giderRepository;
    private final KullaniciRepository kullaniciRepository;

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<SayfaliResponse<UyariResponse>> listele(Long kullaniciId, int page, int size) {
        Page<Uyari> uyariSayfasi = uyariRepository.findByKullaniciIdAndDeletedAtIsNull(
                kullaniciId, PageRequest.of(page, size)
        );

        List<UyariResponse> uyarilar = uyariSayfasi.getContent().stream()
                .map(this::entitydenResponse)
                .collect(Collectors.toList());

        SayfaliResponse<UyariResponse> sonuc = new SayfaliResponse<>(
                uyarilar,
                uyariSayfasi.getNumber(),
                uyariSayfasi.getSize(),
                uyariSayfasi.getTotalElements(),
                uyariSayfasi.getTotalPages(),
                uyariSayfasi.isLast()
        );

        return ApiResponse.basarili(sonuc);
    }

    @Override
    @Transactional
    public ApiResponse<UyariResponse> okunduIsaretle(Long kullaniciId, Long uyariId) {
        Uyari uyari = uyariRepository.findByIdAndKullaniciIdAndDeletedAtIsNull(uyariId, kullaniciId)
                .orElseThrow(() -> new KayitBulunamadiException("Uyarı bulunamadı. ID: " + uyariId));

        uyari.setOkunduMu(true);
        Uyari guncellenen = uyariRepository.save(uyari);

        return ApiResponse.basarili(entitydenResponse(guncellenen));
    }

    @Override
    @Transactional
    public ApiResponse<Void> tumunuOkunduIsaretle(Long kullaniciId) {
        int guncellenenSayi = uyariRepository.tumunuOkunduIsaretle(kullaniciId);
        log.debug("{} uyarı okundu olarak işaretlendi. Kullanıcı: {}", guncellenenSayi, kullaniciId);
        return ApiResponse.basarili("Tüm uyarılar okundu olarak işaretlendi.", null);
    }

    @Override
    @Transactional
    public ApiResponse<Void> sil(Long kullaniciId, Long uyariId) {
        Uyari uyari = uyariRepository.findByIdAndKullaniciIdAndDeletedAtIsNull(uyariId, kullaniciId)
                .orElseThrow(() -> new KayitBulunamadiException("Uyarı bulunamadı. ID: " + uyariId));

        uyari.setDeletedAt(LocalDateTime.now());
        uyariRepository.save(uyari);

        return ApiResponse.basarili("Uyarı başarıyla silindi.", null);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<Long> sayac(Long kullaniciId) {
        long sayi = uyariRepository.countOkunmamisByKullaniciId(kullaniciId);
        return ApiResponse.basarili(sayi);
    }

    @Override
    @Transactional
    public void butceKontrolEt(Long kullaniciId, Long kategoriId, int ay, int yil) {
        Optional<Butce> butceOptional = butceRepository
                .findByKullaniciIdAndKategoriIdAndAyAndYilAndDeletedAtIsNull(kullaniciId, kategoriId, ay, yil);

        if (butceOptional.isEmpty()) {
            return; // Bu kategori için bütçe tanımlanmamış
        }

        Butce butce = butceOptional.get();
        BigDecimal harcananTutar = giderRepository.findKategoriAylikToplam(kullaniciId, kategoriId, ay, yil);

        if (harcananTutar == null) {
            harcananTutar = BigDecimal.ZERO;
        }

        BigDecimal limitTutar = butce.getLimitTutar();
        double kullanimYuzdesi = harcananTutar.doubleValue() / limitTutar.doubleValue() * 100;

        Kullanici kullanici = kullaniciRepository.findById(kullaniciId).orElse(null);
        if (kullanici == null) return;

        // Limit aşıldı mı?
        if (harcananTutar.compareTo(limitTutar) >= 0) {
            long mevcutUyariSayisi = uyariRepository.countBenzerUyari(
                    kullaniciId, UyariTuru.BUTCE_ASIMI, kategoriId, ay, yil
            );

            if (mevcutUyariSayisi == 0) {
                Uyari uyari = Uyari.builder()
                        .kullanici(kullanici)
                        .tur(UyariTuru.BUTCE_ASIMI)
                        .baslik("Bütçe Limitinizi Aştınız!")
                        .mesaj(String.format(
                                "%s kategorisi için belirlediğiniz %.2f TL bütçe limitini aştınız. " +
                                "Bu ay toplam %.2f TL harcandı.",
                                butce.getKategori().getAd(),
                                limitTutar.doubleValue(),
                                harcananTutar.doubleValue()
                        ))
                        .ilgiliId(kategoriId)
                        .build();
                uyariRepository.save(uyari);
                log.info("Bütçe aşımı uyarısı oluşturuldu. Kullanıcı: {}, Kategori: {}", kullaniciId, kategoriId);
            }
        }
        // Uyarı eşiğine yaklaşıldı mı? (limit aşılmadıysa)
        else if (kullanimYuzdesi >= butce.getUyariYuzdesi()) {
            long mevcutUyariSayisi = uyariRepository.countBenzerUyari(
                    kullaniciId, UyariTuru.BUTCE_YAKLASIYOR, kategoriId, ay, yil
            );

            if (mevcutUyariSayisi == 0) {
                Uyari uyari = Uyari.builder()
                        .kullanici(kullanici)
                        .tur(UyariTuru.BUTCE_YAKLASIYOR)
                        .baslik("Bütçe Limitine Yaklaşıyorsunuz")
                        .mesaj(String.format(
                                "%s kategorisi için belirlediğiniz %.2f TL bütçenizin %%%.0f'ini kullandınız. " +
                                "Bu ay toplam %.2f TL harcandı.",
                                butce.getKategori().getAd(),
                                limitTutar.doubleValue(),
                                kullanimYuzdesi,
                                harcananTutar.doubleValue()
                        ))
                        .ilgiliId(kategoriId)
                        .build();
                uyariRepository.save(uyari);
                log.debug("Bütçe yaklaşma uyarısı oluşturuldu. Kullanıcı: {}, Kategori: {}", kullaniciId, kategoriId);
            }
        }
    }

    private UyariResponse entitydenResponse(Uyari uyari) {
        return new UyariResponse(
                uyari.getId(),
                uyari.getTur(),
                uyari.getBaslik(),
                uyari.getMesaj(),
                Boolean.TRUE.equals(uyari.getOkunduMu()),
                uyari.getIlgiliId(),
                uyari.getCreatedAt()
        );
    }
}
