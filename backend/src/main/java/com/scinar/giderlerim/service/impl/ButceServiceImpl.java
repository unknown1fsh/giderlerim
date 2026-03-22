package com.scinar.giderlerim.service.impl;

import com.scinar.giderlerim.dto.request.ButceGuncelleRequest;
import com.scinar.giderlerim.dto.request.ButceOlusturRequest;
import com.scinar.giderlerim.dto.response.ApiResponse;
import com.scinar.giderlerim.dto.response.ButceOzetResponse;
import com.scinar.giderlerim.dto.response.ButceResponse;
import com.scinar.giderlerim.dto.response.KategoriResponse;
import com.scinar.giderlerim.entity.Butce;
import com.scinar.giderlerim.entity.Kategori;
import com.scinar.giderlerim.entity.Kullanici;
import com.scinar.giderlerim.exception.KayitBulunamadiException;
import com.scinar.giderlerim.repository.ButceRepository;
import com.scinar.giderlerim.repository.GiderRepository;
import com.scinar.giderlerim.repository.KategoriRepository;
import com.scinar.giderlerim.repository.KullaniciRepository;
import com.scinar.giderlerim.service.ButceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ButceServiceImpl implements ButceService {

    private final ButceRepository butceRepository;
    private final KategoriRepository kategoriRepository;
    private final KullaniciRepository kullaniciRepository;
    private final GiderRepository giderRepository;

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<ButceResponse>> listele(Long kullaniciId, int ay, int yil) {
        List<ButceResponse> butceler = butceRepository
                .findByKullaniciIdAndAyAndYilAndDeletedAtIsNull(kullaniciId, ay, yil)
                .stream()
                .map(this::entitydenResponse)
                .collect(Collectors.toList());
        return ApiResponse.basarili(butceler);
    }

    @Override
    @Transactional
    public ApiResponse<ButceResponse> olustur(Long kullaniciId, ButceOlusturRequest request) {
        Kullanici kullanici = kullaniciRepository.findById(kullaniciId)
                .orElseThrow(() -> new KayitBulunamadiException("Kullanıcı bulunamadı."));

        Kategori kategori = kategoriRepository
                .findByIdAndKullaniciIdOrSistemMi(request.kategoriId(), kullaniciId)
                .orElseThrow(() -> new KayitBulunamadiException("Kategori bulunamadı. ID: " + request.kategoriId()));

        // Aynı ay/yıl için aynı kategori bütçesi zaten var mı?
        butceRepository.findByKullaniciIdAndKategoriIdAndAyAndYilAndDeletedAtIsNull(
                kullaniciId, kategori.getId(), request.ay(), request.yil()
        ).ifPresent(b -> {
            throw new IllegalArgumentException(
                    "Bu kategori için " + request.ay() + "/" + request.yil() + " dönemine ait bütçe zaten tanımlanmış."
            );
        });

        Butce yeniButce = Butce.builder()
                .kullanici(kullanici)
                .kategori(kategori)
                .ay(request.ay())
                .yil(request.yil())
                .limitTutar(request.limitTutar())
                .uyariYuzdesi(request.uyariYuzdesi() != null ? request.uyariYuzdesi() : 80)
                .aktif(true)
                .build();

        Butce kaydedilen = butceRepository.save(yeniButce);
        log.debug("Yeni bütçe oluşturuldu. ID: {}, Kullanıcı: {}", kaydedilen.getId(), kullaniciId);

        return ApiResponse.basarili("Bütçe başarıyla oluşturuldu.", entitydenResponse(kaydedilen));
    }

    @Override
    @Transactional
    public ApiResponse<ButceResponse> guncelle(Long kullaniciId, Long butceId, ButceGuncelleRequest request) {
        Butce butce = butceRepository.findByIdAndKullaniciIdAndDeletedAtIsNull(butceId, kullaniciId)
                .orElseThrow(() -> new KayitBulunamadiException("Bütçe bulunamadı. ID: " + butceId));

        if (request.limitTutar() != null) {
            butce.setLimitTutar(request.limitTutar());
        }
        if (request.uyariYuzdesi() != null) {
            butce.setUyariYuzdesi(request.uyariYuzdesi());
        }

        Butce guncellenen = butceRepository.save(butce);
        return ApiResponse.basarili("Bütçe başarıyla güncellendi.", entitydenResponse(guncellenen));
    }

    @Override
    @Transactional
    public ApiResponse<Void> sil(Long kullaniciId, Long butceId) {
        Butce butce = butceRepository.findByIdAndKullaniciIdAndDeletedAtIsNull(butceId, kullaniciId)
                .orElseThrow(() -> new KayitBulunamadiException("Bütçe bulunamadı. ID: " + butceId));

        butce.setDeletedAt(LocalDateTime.now());
        butce.setAktif(false);
        butceRepository.save(butce);

        return ApiResponse.basarili("Bütçe başarıyla silindi.", null);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<ButceOzetResponse>> getAylikOzetler(Long kullaniciId, int ay, int yil) {
        List<Butce> butceler = butceRepository.findByKullaniciIdAndAyAndYilAndDeletedAtIsNull(kullaniciId, ay, yil);

        List<ButceOzetResponse> ozetler = butceler.stream().map(butce -> {
            BigDecimal harcananTutar = giderRepository.findKategoriAylikToplam(
                    kullaniciId, butce.getKategori().getId(), ay, yil
            );

            if (harcananTutar == null) {
                harcananTutar = BigDecimal.ZERO;
            }

            BigDecimal limitTutar = butce.getLimitTutar();
            BigDecimal kalanTutar = limitTutar.subtract(harcananTutar);
            int kullanimYuzdesi = (int) (harcananTutar.doubleValue() / limitTutar.doubleValue() * 100);
            boolean limitAsildi = harcananTutar.compareTo(limitTutar) >= 0;
            boolean uyariEsigi = kullanimYuzdesi >= butce.getUyariYuzdesi();

            KategoriResponse kategoriResponse = new KategoriResponse(
                    butce.getKategori().getId(),
                    butce.getKategori().getAd(),
                    butce.getKategori().getIkon(),
                    butce.getKategori().getRenk(),
                    Boolean.TRUE.equals(butce.getKategori().getSistemMi())
            );

            return new ButceOzetResponse(
                    butce.getId(),
                    kategoriResponse,
                    limitTutar,
                    harcananTutar,
                    kalanTutar,
                    kullanimYuzdesi,
                    limitAsildi,
                    uyariEsigi
            );
        }).collect(Collectors.toList());

        return ApiResponse.basarili(ozetler);
    }

    private ButceResponse entitydenResponse(Butce butce) {
        KategoriResponse kategoriResponse = new KategoriResponse(
                butce.getKategori().getId(),
                butce.getKategori().getAd(),
                butce.getKategori().getIkon(),
                butce.getKategori().getRenk(),
                Boolean.TRUE.equals(butce.getKategori().getSistemMi())
        );

        return new ButceResponse(
                butce.getId(),
                kategoriResponse,
                butce.getAy(),
                butce.getYil(),
                butce.getLimitTutar(),
                butce.getUyariYuzdesi(),
                Boolean.TRUE.equals(butce.getAktif())
        );
    }
}
