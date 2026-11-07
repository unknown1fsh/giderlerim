package com.scinar.giderlerim.service.impl;

import com.scinar.giderlerim.dto.request.AiIzniRequest;
import com.scinar.giderlerim.dto.request.ProfilGuncelleRequest;
import com.scinar.giderlerim.dto.response.ApiResponse;
import com.scinar.giderlerim.dto.response.KullaniciResponse;
import com.scinar.giderlerim.entity.Kullanici;
import com.scinar.giderlerim.exception.KayitBulunamadiException;
import com.scinar.giderlerim.repository.KullaniciRepository;
import com.scinar.giderlerim.service.KullaniciService;
import com.scinar.giderlerim.util.AiIzinKapisi;
import com.scinar.giderlerim.util.EmailDogrulamaKapisi;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class KullaniciServiceImpl implements KullaniciService {

    private final KullaniciRepository kullaniciRepository;

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<KullaniciResponse> getProfil(Long kullaniciId) {
        Kullanici kullanici = kullaniciGetir(kullaniciId);
        return ApiResponse.basarili(entitydenResponse(kullanici));
    }

    @Override
    @Transactional
    public ApiResponse<KullaniciResponse> gunceleProfil(Long kullaniciId, ProfilGuncelleRequest request) {
        Kullanici kullanici = kullaniciGetir(kullaniciId);

        if (request.ad() != null && !request.ad().isBlank()) {
            kullanici.setAd(request.ad().trim());
        }
        if (request.soyad() != null && !request.soyad().isBlank()) {
            kullanici.setSoyad(request.soyad().trim());
        }
        if (request.paraBirimi() != null) {
            kullanici.setParaBirimi(request.paraBirimi());
        }

        Kullanici guncellenen = kullaniciRepository.save(kullanici);
        log.debug("Kullanıcı profili güncellendi. ID: {}", kullaniciId);

        return ApiResponse.basarili("Profil başarıyla güncellendi.", entitydenResponse(guncellenen));
    }

    @Override
    @Transactional
    public ApiResponse<Void> hesabiSil(Long kullaniciId) {
        Kullanici kullanici = kullaniciGetir(kullaniciId);
        kullanici.setDeletedAt(LocalDateTime.now());
        kullanici.setAktif(false);
        kullaniciRepository.save(kullanici);
        log.info("Kullanıcı hesabı silindi. ID: {}", kullaniciId);
        return ApiResponse.basarili("Hesabınız başarıyla silindi.", null);
    }

    @Override
    @Transactional
    public ApiResponse<KullaniciResponse> aiIzniGuncelle(Long kullaniciId, AiIzniRequest request) {
        Kullanici kullanici = kullaniciGetir(kullaniciId);
        boolean izin = Boolean.TRUE.equals(request.izin());
        kullanici.setAiIzni(izin);
        kullanici.setAiIzniTarihi(LocalDateTime.now());
        kullanici.setAiIzniMetinSurumu(izin ? AiIzinKapisi.METIN_SURUMU : null);
        Kullanici guncellenen = kullaniciRepository.save(kullanici);
        log.info("AI izni güncellendi. Kullanıcı: {}, izin: {}, metin: {}", kullaniciId, izin, AiIzinKapisi.METIN_SURUMU);
        return ApiResponse.basarili(izin ? "Yapay zeka özellikleri etkinleştirildi." : "Yapay zeka özellikleri kapatıldı.",
                entitydenResponse(guncellenen));
    }

    private Kullanici kullaniciGetir(Long kullaniciId) {
        return kullaniciRepository.findById(kullaniciId)
                .filter(k -> k.getDeletedAt() == null)
                .orElseThrow(() -> new KayitBulunamadiException("Kullanıcı bulunamadı."));
    }

    private KullaniciResponse entitydenResponse(Kullanici kullanici) {
        return new KullaniciResponse(
                kullanici.getId(),
                kullanici.getAd(),
                kullanici.getSoyad(),
                kullanici.getEmail(),
                kullanici.getPlan(),
                kullanici.getParaBirimi(),
                kullanici.getAvatarUrl(),
                kullanici.getAdminMi(),
                Boolean.TRUE.equals(kullanici.getAiIzni()),
                Boolean.TRUE.equals(kullanici.getEmailDogrulandi()),
                EmailDogrulamaKapisi.dogrulamaBekleniyor(kullanici)
        );
    }
}
