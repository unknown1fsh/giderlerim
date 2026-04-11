package com.scinar.giderlerim.service.impl;

import com.scinar.giderlerim.dto.request.DestekTalebiOlusturRequest;
import com.scinar.giderlerim.dto.request.DestekTalebiYanitlaRequest;
import com.scinar.giderlerim.dto.response.ApiResponse;
import com.scinar.giderlerim.dto.response.DestekTalebiResponse;
import com.scinar.giderlerim.dto.response.SayfaliResponse;
import com.scinar.giderlerim.entity.DestekTalebi;
import com.scinar.giderlerim.entity.Kullanici;
import com.scinar.giderlerim.entity.enums.DestekDurumu;
import com.scinar.giderlerim.entity.enums.DestekKategorisi;
import com.scinar.giderlerim.entity.enums.DestekOnceligi;
import com.scinar.giderlerim.entity.enums.PlanTuru;
import com.scinar.giderlerim.exception.KayitBulunamadiException;
import com.scinar.giderlerim.repository.DestekTalebiRepository;
import com.scinar.giderlerim.repository.KullaniciRepository;
import com.scinar.giderlerim.service.DestekTalebiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DestekTalebiServiceImpl implements DestekTalebiService {

    private final DestekTalebiRepository destekTalebiRepository;
    private final KullaniciRepository kullaniciRepository;

    @Override
    @Transactional
    public ApiResponse<DestekTalebiResponse> olustur(Long kullaniciId, DestekTalebiOlusturRequest request) {
        Kullanici kullanici = kullaniciRepository.findById(kullaniciId)
                .orElseThrow(() -> new KayitBulunamadiException("Kullanıcı bulunamadı. ID: " + kullaniciId));

        DestekOnceligi oncelik = request.oncelik() != null ? request.oncelik() : DestekOnceligi.NORMAL;
        if (kullanici.getPlan() == PlanTuru.PREMIUM || kullanici.getPlan() == PlanTuru.ULTRA) {
            oncelik = enAzOncelik(oncelik, DestekOnceligi.YUKSEK);
        }

        DestekTalebi talep = DestekTalebi.builder()
                .kullanici(kullanici)
                .konu(request.konu())
                .mesaj(request.mesaj())
                .kategori(request.kategori() != null ? request.kategori() : DestekKategorisi.GENEL)
                .oncelik(oncelik)
                .build();

        DestekTalebi kaydedilen = destekTalebiRepository.save(talep);
        log.info("Yeni destek talebi oluşturuldu. ID: {}, Kullanıcı: {}", kaydedilen.getId(), kullaniciId);

        return ApiResponse.basarili("Destek talebiniz başarıyla oluşturuldu.", entitydenResponse(kaydedilen));
    }

    /** Ücretli planda talep en az {@code taban} önceliğinde kaydedilir (sıra enum ordinal ile). */
    private static DestekOnceligi enAzOncelik(DestekOnceligi secim, DestekOnceligi taban) {
        return secim.ordinal() >= taban.ordinal() ? secim : taban;
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<SayfaliResponse<DestekTalebiResponse>> kullaniciTalepleri(Long kullaniciId, int sayfa, int boyut) {
        Page<DestekTalebi> talepSayfasi = destekTalebiRepository.findByKullaniciIdAndDeletedAtIsNull(
                kullaniciId, PageRequest.of(sayfa, boyut)
        );

        List<DestekTalebiResponse> talepler = talepSayfasi.getContent().stream()
                .map(this::entitydenResponse)
                .collect(Collectors.toList());

        SayfaliResponse<DestekTalebiResponse> sonuc = new SayfaliResponse<>(
                talepler,
                talepSayfasi.getNumber(),
                talepSayfasi.getSize(),
                talepSayfasi.getTotalElements(),
                talepSayfasi.getTotalPages(),
                talepSayfasi.isLast()
        );

        return ApiResponse.basarili(sonuc);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<DestekTalebiResponse> kullaniciTalebiGetir(Long kullaniciId, Long talepId) {
        DestekTalebi talep = destekTalebiRepository.findByIdAndKullaniciIdAndDeletedAtIsNull(talepId, kullaniciId)
                .orElseThrow(() -> new KayitBulunamadiException("Destek talebi bulunamadı. ID: " + talepId));

        return ApiResponse.basarili(entitydenResponse(talep));
    }

    @Override
    @Transactional
    public ApiResponse<Void> sil(Long kullaniciId, Long talepId) {
        DestekTalebi talep = destekTalebiRepository.findByIdAndKullaniciIdAndDeletedAtIsNull(talepId, kullaniciId)
                .orElseThrow(() -> new KayitBulunamadiException("Destek talebi bulunamadı. ID: " + talepId));

        talep.setDeletedAt(LocalDateTime.now());
        destekTalebiRepository.save(talep);

        return ApiResponse.basarili("Destek talebi başarıyla silindi.", null);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<SayfaliResponse<DestekTalebiResponse>> adminTumTalepleri(
            String durum, String oncelik, String kategori, int sayfa, int boyut) {

        DestekDurumu durumEnum = parseEnum(durum, DestekDurumu.class);
        DestekOnceligi oncelikEnum = parseEnum(oncelik, DestekOnceligi.class);
        DestekKategorisi kategoriEnum = parseEnum(kategori, DestekKategorisi.class);

        Page<DestekTalebi> talepSayfasi = destekTalebiRepository.findAllFiltreli(
                durumEnum, oncelikEnum, kategoriEnum, PageRequest.of(sayfa, boyut)
        );

        List<DestekTalebiResponse> talepler = talepSayfasi.getContent().stream()
                .map(this::entitydenResponse)
                .collect(Collectors.toList());

        SayfaliResponse<DestekTalebiResponse> sonuc = new SayfaliResponse<>(
                talepler,
                talepSayfasi.getNumber(),
                talepSayfasi.getSize(),
                talepSayfasi.getTotalElements(),
                talepSayfasi.getTotalPages(),
                talepSayfasi.isLast()
        );

        return ApiResponse.basarili(sonuc);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<DestekTalebiResponse> adminTalebiGetir(Long talepId) {
        DestekTalebi talep = destekTalebiRepository.findByIdAndDeletedAtIsNull(talepId)
                .orElseThrow(() -> new KayitBulunamadiException("Destek talebi bulunamadı. ID: " + talepId));

        return ApiResponse.basarili(entitydenResponse(talep));
    }

    @Override
    @Transactional
    public ApiResponse<DestekTalebiResponse> adminYanitla(Long talepId, Long adminId, DestekTalebiYanitlaRequest request) {
        DestekTalebi talep = destekTalebiRepository.findByIdAndDeletedAtIsNull(talepId)
                .orElseThrow(() -> new KayitBulunamadiException("Destek talebi bulunamadı. ID: " + talepId));

        Kullanici admin = kullaniciRepository.findById(adminId)
                .orElseThrow(() -> new KayitBulunamadiException("Admin bulunamadı. ID: " + adminId));

        talep.setAdminYaniti(request.adminYaniti());
        talep.setYanitlayanAdmin(admin);
        talep.setYanitlanmaTarihi(LocalDateTime.now());
        talep.setDurum(request.durum() != null ? request.durum() : DestekDurumu.YANITLANDI);

        DestekTalebi guncellenen = destekTalebiRepository.save(talep);
        log.info("Destek talebi yanıtlandı. ID: {}, Admin: {}", talepId, adminId);

        return ApiResponse.basarili("Destek talebi yanıtlandı.", entitydenResponse(guncellenen));
    }

    @Override
    @Transactional
    public ApiResponse<DestekTalebiResponse> adminDurumGuncelle(Long talepId, DestekDurumu durum) {
        DestekTalebi talep = destekTalebiRepository.findByIdAndDeletedAtIsNull(talepId)
                .orElseThrow(() -> new KayitBulunamadiException("Destek talebi bulunamadı. ID: " + talepId));

        talep.setDurum(durum);
        DestekTalebi guncellenen = destekTalebiRepository.save(talep);

        return ApiResponse.basarili("Talep durumu güncellendi.", entitydenResponse(guncellenen));
    }

    @Override
    public long toplamTalepSayisi() {
        return destekTalebiRepository.countByDeletedAtIsNull();
    }

    @Override
    public long acikTalepSayisi() {
        return destekTalebiRepository.countByDurumAndDeletedAtIsNull(DestekDurumu.ACIK);
    }

    private DestekTalebiResponse entitydenResponse(DestekTalebi talep) {
        String yanitlayanAdminAdi = null;
        if (talep.getYanitlayanAdmin() != null) {
            yanitlayanAdminAdi = talep.getYanitlayanAdmin().getAd() + " " + talep.getYanitlayanAdmin().getSoyad();
        }

        String kullaniciAdi = talep.getKullanici().getAd() + " " + talep.getKullanici().getSoyad();
        String kullaniciEmail = talep.getKullanici().getEmail();

        return new DestekTalebiResponse(
                talep.getId(),
                talep.getKonu(),
                talep.getMesaj(),
                talep.getDurum(),
                talep.getOncelik(),
                talep.getKategori(),
                talep.getAdminYaniti(),
                yanitlayanAdminAdi,
                talep.getYanitlanmaTarihi(),
                kullaniciAdi,
                kullaniciEmail,
                talep.getCreatedAt(),
                talep.getUpdatedAt()
        );
    }

    private <T extends Enum<T>> T parseEnum(String value, Class<T> enumClass) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return Enum.valueOf(enumClass, value.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
