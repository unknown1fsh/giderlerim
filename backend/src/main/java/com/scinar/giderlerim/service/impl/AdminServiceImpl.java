package com.scinar.giderlerim.service.impl;

import com.scinar.giderlerim.dto.admin.*;
import com.scinar.giderlerim.dto.response.ApiResponse;
import com.scinar.giderlerim.entity.Kullanici;
import com.scinar.giderlerim.entity.SistemParametresi;
import com.scinar.giderlerim.entity.enums.PlanTuru;
import com.scinar.giderlerim.repository.*;
import com.scinar.giderlerim.service.AdminService;
import com.scinar.giderlerim.service.DestekTalebiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final KullaniciRepository kullaniciRepository;
    private final GiderRepository giderRepository;
    private final ButceRepository butceRepository;
    private final AiSohbetOturumRepository aiSohbetOturumRepository;
    private final AiSohbetMesajiRepository aiSohbetMesajiRepository;
    private final CsvYuklemeRepository csvYuklemeRepository;
    private final BelgeYuklemeRepository belgeYuklemeRepository;
    private final UyariRepository uyariRepository;
    private final SistemParametresiRepository sistemParametresiRepository;
    private final DestekTalebiService destekTalebiService;

    @Override
    public ApiResponse<AdminIstatistikDto> getIstatistikler() {
        List<Kullanici> tumKullanicilar = kullaniciRepository.findAll();

        long toplamKullanici = tumKullanicilar.stream().filter(k -> k.getDeletedAt() == null).count();
        long aktifKullanici = tumKullanicilar.stream().filter(k -> k.getDeletedAt() == null && Boolean.TRUE.equals(k.getAktif())).count();
        long silinenKullanici = tumKullanicilar.stream().filter(k -> k.getDeletedAt() != null).count();
        long adminKullanici = tumKullanicilar.stream().filter(k -> k.getDeletedAt() == null && Boolean.TRUE.equals(k.getAdminMi())).count();
        long freeKullanici = tumKullanicilar.stream().filter(k -> k.getDeletedAt() == null && k.getPlan() == PlanTuru.FREE).count();
        long premiumKullanici = tumKullanicilar.stream().filter(k -> k.getDeletedAt() == null && k.getPlan() == PlanTuru.PREMIUM).count();
        long ultraKullanici = tumKullanicilar.stream().filter(k -> k.getDeletedAt() == null && k.getPlan() == PlanTuru.ULTRA).count();

        long toplamGiderSayisi = giderRepository.countToplamGider();
        BigDecimal toplamGiderTutari = giderRepository.sumToplamGiderTutari();

        long toplamButceSayisi = butceRepository.count();
        long toplamAiOturumSayisi = aiSohbetOturumRepository.count();
        long toplamAiMesajSayisi = aiSohbetMesajiRepository.count();
        long toplamCsvYuklemeSayisi = csvYuklemeRepository.count();
        long toplamBelgeYuklemeSayisi = belgeYuklemeRepository.count();

        List<com.scinar.giderlerim.entity.Uyari> uyarilar = uyariRepository.findAll();
        long toplamUyariSayisi = uyarilar.stream().filter(u -> u.getDeletedAt() == null).count();
        long okunmamisUyariSayisi = uyarilar.stream().filter(u -> u.getDeletedAt() == null && Boolean.FALSE.equals(u.getOkunduMu())).count();

        long toplamDestekTalebiSayisi = destekTalebiService.toplamTalepSayisi();
        long acikDestekTalebiSayisi = destekTalebiService.acikTalepSayisi();

        AdminIstatistikDto dto = new AdminIstatistikDto(
                toplamKullanici, aktifKullanici, silinenKullanici, adminKullanici,
                freeKullanici, premiumKullanici, ultraKullanici,
                toplamGiderSayisi, toplamGiderTutari,
                toplamButceSayisi,
                toplamAiOturumSayisi, toplamAiMesajSayisi,
                toplamCsvYuklemeSayisi, toplamBelgeYuklemeSayisi,
                toplamUyariSayisi, okunmamisUyariSayisi,
                toplamDestekTalebiSayisi, acikDestekTalebiSayisi
        );

        return ApiResponse.basarili(dto);
    }

    @Override
    public ApiResponse<Page<AdminKullaniciListeDto>> kullanicilariListele(
            String arama, String plan, Boolean aktif, Pageable pageable) {

        Specification<Kullanici> spec = Specification.where(null);

        if (arama != null && !arama.isBlank()) {
            String aramaLower = "%" + arama.toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("ad")), aramaLower),
                    cb.like(cb.lower(root.get("soyad")), aramaLower),
                    cb.like(cb.lower(root.get("email")), aramaLower)
            ));
        }

        if (plan != null && !plan.isBlank()) {
            try {
                PlanTuru planTuru = PlanTuru.valueOf(plan.toUpperCase());
                spec = spec.and((root, query, cb) -> cb.equal(root.get("plan"), planTuru));
            } catch (IllegalArgumentException ignored) {}
        }

        if (aktif != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("aktif"), aktif));
        }

        Page<AdminKullaniciListeDto> sonuc = kullaniciRepository.findAll(spec, pageable)
                .map(this::kullanicidanDto);

        return ApiResponse.basarili(sonuc);
    }

    @Override
    public ApiResponse<AdminKullaniciListeDto> kullaniciGetir(Long id) {
        Kullanici kullanici = kullaniciRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Kullanıcı bulunamadı"));
        return ApiResponse.basarili(kullanicidanDto(kullanici));
    }

    @Override
    @Transactional
    public ApiResponse<AdminKullaniciListeDto> kullaniciGuncelle(Long id, AdminKullaniciGuncelleRequest request) {
        Kullanici kullanici = kullaniciRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Kullanıcı bulunamadı"));

        if (request.plan() != null) {
            kullanici.setPlan(request.plan());
        }
        if (request.adminMi() != null) {
            kullanici.setAdminMi(request.adminMi());
        }
        if (request.aktif() != null) {
            kullanici.setAktif(request.aktif());
        }

        Kullanici kaydedildi = kullaniciRepository.save(kullanici);
        return ApiResponse.basarili("Kullanıcı güncellendi", kullanicidanDto(kaydedildi));
    }

    @Override
    @Transactional
    public ApiResponse<Void> kullaniciSil(Long id) {
        Kullanici kullanici = kullaniciRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Kullanıcı bulunamadı"));

        if (Boolean.TRUE.equals(kullanici.getAdminMi())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Admin kullanıcı silinemez");
        }

        kullanici.setDeletedAt(LocalDateTime.now());
        kullanici.setAktif(false);
        kullaniciRepository.save(kullanici);

        return ApiResponse.basarili("Kullanıcı silindi", null);
    }

    @Override
    public ApiResponse<List<SistemParametresiDto>> parametreleriListele() {
        List<SistemParametresiDto> liste = sistemParametresiRepository.findAllByOrderByKategoriAscAnahtarAsc()
                .stream()
                .map(this::parametredanDto)
                .toList();
        return ApiResponse.basarili(liste);
    }

    @Override
    @Transactional
    public ApiResponse<SistemParametresiDto> parametreGuncelle(Long id, SistemParametresiGuncelleRequest request) {
        SistemParametresi parametre = sistemParametresiRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Parametre bulunamadı"));

        if (!Boolean.TRUE.equals(parametre.getDuzenlenebilir())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bu parametre düzenlenemez");
        }

        parametre.setDeger(request.deger());
        SistemParametresi kaydedildi = sistemParametresiRepository.save(parametre);
        return ApiResponse.basarili("Parametre güncellendi", parametredanDto(kaydedildi));
    }

    @Override
    @Transactional
    public ApiResponse<SistemParametresiDto> parametreOlustur(SistemParametresiOlusturRequest request) {
        if (sistemParametresiRepository.existsByAnahtar(request.anahtar())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Bu anahtar zaten mevcut: " + request.anahtar());
        }

        SistemParametresi yeni = SistemParametresi.builder()
                .anahtar(request.anahtar())
                .deger(request.deger())
                .varsayilanDeger(request.varsayilanDeger())
                .aciklama(request.aciklama())
                .tip(request.tip() != null ? request.tip() : "STRING")
                .kategori(request.kategori() != null ? request.kategori() : "GENEL")
                .duzenlenebilir(true)
                .build();

        SistemParametresi kaydedildi = sistemParametresiRepository.save(yeni);
        return ApiResponse.basarili("Parametre oluşturuldu", parametredanDto(kaydedildi));
    }

    @Override
    @Transactional
    public ApiResponse<Void> parametreSil(Long id) {
        SistemParametresi parametre = sistemParametresiRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Parametre bulunamadı"));

        sistemParametresiRepository.delete(parametre);
        return ApiResponse.basarili("Parametre silindi", null);
    }

    @Override
    @Transactional
    public ApiResponse<SistemParametresiDto> parametreVarsayilanaGetir(Long id) {
        SistemParametresi parametre = sistemParametresiRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Parametre bulunamadı"));

        parametre.setDeger(parametre.getVarsayilanDeger());
        SistemParametresi kaydedildi = sistemParametresiRepository.save(parametre);
        return ApiResponse.basarili("Parametre varsayılana sıfırlandı", parametredanDto(kaydedildi));
    }

    // --- Yardımcı dönüşüm metodları ---

    private AdminKullaniciListeDto kullanicidanDto(Kullanici k) {
        long giderSayisi = kullaniciRepository.countGiderByKullaniciId(k.getId());

        return new AdminKullaniciListeDto(
                k.getId(),
                k.getAd(),
                k.getSoyad(),
                k.getEmail(),
                k.getPlan(),
                k.getParaBirimi(),
                k.getAdminMi(),
                k.getAktif(),
                k.getEmailDogrulandi(),
                k.getSonGirisTarihi(),
                k.getCreatedAt(),
                giderSayisi
        );
    }

    private SistemParametresiDto parametredanDto(SistemParametresi p) {
        return new SistemParametresiDto(
                p.getId(),
                p.getAnahtar(),
                p.getDeger(),
                p.getVarsayilanDeger(),
                p.getAciklama(),
                p.getTip(),
                p.getKategori(),
                p.getDuzenlenebilir(),
                p.getUpdatedAt()
        );
    }
}
