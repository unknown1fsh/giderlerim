package com.scinar.giderlerim.service.impl;

import com.scinar.giderlerim.dto.request.KategoriGuncelleRequest;
import com.scinar.giderlerim.dto.request.KategoriOlusturRequest;
import com.scinar.giderlerim.dto.response.ApiResponse;
import com.scinar.giderlerim.dto.response.KategoriResponse;
import com.scinar.giderlerim.entity.Kategori;
import com.scinar.giderlerim.entity.Kullanici;
import com.scinar.giderlerim.exception.KayitBulunamadiException;
import com.scinar.giderlerim.exception.YetkisizErisimException;
import com.scinar.giderlerim.repository.KategoriRepository;
import com.scinar.giderlerim.repository.KullaniciRepository;
import com.scinar.giderlerim.service.KategoriService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class KategoriServiceImpl implements KategoriService {

    private final KategoriRepository kategoriRepository;
    private final KullaniciRepository kullaniciRepository;

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<KategoriResponse>> listele(Long kullaniciId) {
        List<KategoriResponse> kategoriler = kategoriRepository
                .findAllByKullaniciId(kullaniciId)
                .stream()
                .map(this::entitydenResponse)
                .collect(Collectors.toList());
        return ApiResponse.basarili(kategoriler);
    }

    @Override
    @Transactional
    public ApiResponse<KategoriResponse> olustur(Long kullaniciId, KategoriOlusturRequest request) {
        Kullanici kullanici = kullaniciRepository.findById(kullaniciId)
                .orElseThrow(() -> new KayitBulunamadiException("Kullanıcı bulunamadı."));

        Kategori yeniKategori = Kategori.builder()
                .kullanici(kullanici)
                .ad(request.ad().trim())
                .ikon(request.ikon() != null ? request.ikon() : "tag")
                .renk(request.renk() != null ? request.renk() : "#6B7280")
                .sistemMi(false)
                .aktif(true)
                .build();

        Kategori kaydedilen = kategoriRepository.save(yeniKategori);
        log.debug("Yeni kategori oluşturuldu. ID: {}, Kullanıcı: {}", kaydedilen.getId(), kullaniciId);

        return ApiResponse.basarili("Kategori başarıyla oluşturuldu.", entitydenResponse(kaydedilen));
    }

    @Override
    @Transactional
    public ApiResponse<KategoriResponse> guncelle(Long kullaniciId, Long kategoriId, KategoriGuncelleRequest request) {
        Kategori kategori = kategoriRepository.findByIdAndDeletedAtIsNull(kategoriId)
                .orElseThrow(() -> new KayitBulunamadiException("Kategori bulunamadı."));

        // Sistem kategorileri değiştirilemez
        if (Boolean.TRUE.equals(kategori.getSistemMi())) {
            throw new YetkisizErisimException("Sistem kategorileri değiştirilemez.");
        }

        // Sadece sahibi güncelleyebilir
        if (kategori.getKullanici() == null || !kategori.getKullanici().getId().equals(kullaniciId)) {
            throw new YetkisizErisimException("Bu kategoriye erişim yetkiniz bulunmamaktadır.");
        }

        if (request.ad() != null && !request.ad().isBlank()) {
            kategori.setAd(request.ad().trim());
        }
        if (request.ikon() != null) {
            kategori.setIkon(request.ikon());
        }
        if (request.renk() != null) {
            kategori.setRenk(request.renk());
        }

        Kategori guncellenen = kategoriRepository.save(kategori);
        return ApiResponse.basarili("Kategori başarıyla güncellendi.", entitydenResponse(guncellenen));
    }

    @Override
    @Transactional
    public ApiResponse<Void> sil(Long kullaniciId, Long kategoriId) {
        Kategori kategori = kategoriRepository.findByIdAndDeletedAtIsNull(kategoriId)
                .orElseThrow(() -> new KayitBulunamadiException("Kategori bulunamadı."));

        // Sistem kategorileri silinemez
        if (Boolean.TRUE.equals(kategori.getSistemMi())) {
            throw new YetkisizErisimException("Sistem kategorileri silinemez.");
        }

        // Sadece sahibi silebilir
        if (kategori.getKullanici() == null || !kategori.getKullanici().getId().equals(kullaniciId)) {
            throw new YetkisizErisimException("Bu kategoriye erişim yetkiniz bulunmamaktadır.");
        }

        kategori.setDeletedAt(LocalDateTime.now());
        kategori.setAktif(false);
        kategoriRepository.save(kategori);

        log.debug("Kategori silindi. ID: {}, Kullanıcı: {}", kategoriId, kullaniciId);
        return ApiResponse.basarili("Kategori başarıyla silindi.", null);
    }

    private KategoriResponse entitydenResponse(Kategori kategori) {
        return new KategoriResponse(
                kategori.getId(),
                kategori.getAd(),
                kategori.getIkon(),
                kategori.getRenk(),
                Boolean.TRUE.equals(kategori.getSistemMi())
        );
    }
}
