package com.scinar.giderlerim.service.impl;

import com.scinar.giderlerim.dto.response.*;
import com.scinar.giderlerim.entity.enums.OdemeYontemi;
import com.scinar.giderlerim.repository.GiderRepository;
import com.scinar.giderlerim.repository.UyariRepository;
import com.scinar.giderlerim.service.ButceService;
import com.scinar.giderlerim.service.DashboardService;
import com.scinar.giderlerim.util.TarihYardimcisi;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final GiderRepository giderRepository;
    private final UyariRepository uyariRepository;
    private final ButceService butceService;

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<DashboardResponse> getDashboard(Long kullaniciId, int ay, int yil) {
        // Bu ayın toplamları
        BigDecimal toplamHarcama = giderRepository.findAylikToplam(kullaniciId, ay, yil);
        if (toplamHarcama == null) toplamHarcama = BigDecimal.ZERO;

        BigDecimal nakitHarcama = giderRepository.findAylikToplamByOdemeYontemi(kullaniciId, ay, yil, OdemeYontemi.NAKIT);
        if (nakitHarcama == null) nakitHarcama = BigDecimal.ZERO;

        BigDecimal krediKartiHarcama = giderRepository.findAylikToplamByOdemeYontemi(kullaniciId, ay, yil, OdemeYontemi.KREDI_KARTI);
        if (krediKartiHarcama == null) krediKartiHarcama = BigDecimal.ZERO;

        // Önceki ayın toplamı
        LocalDate oncekiAy = LocalDate.of(yil, ay, 1).minusMonths(1);
        BigDecimal oncekiAyHarcama = giderRepository.findAylikToplam(
                kullaniciId, oncekiAy.getMonthValue(), oncekiAy.getYear()
        );
        if (oncekiAyHarcama == null) oncekiAyHarcama = BigDecimal.ZERO;

        // Değişim yüzdesi
        double degisimYuzdesi = 0.0;
        if (oncekiAyHarcama.compareTo(BigDecimal.ZERO) > 0) {
            degisimYuzdesi = toplamHarcama.subtract(oncekiAyHarcama)
                    .divide(oncekiAyHarcama, 4, RoundingMode.HALF_UP)
                    .doubleValue() * 100;
        }

        // Kategori dağılımı
        List<KategoriHarcamaResponse> kategoriDagilimi = hesaplaKategoriDagilimi(kullaniciId, ay, yil, toplamHarcama);

        // Bütçe durumları
        List<ButceOzetResponse> butceDurumlari = butceService.getAylikOzetler(kullaniciId, ay, yil).data();

        // Gider sayıları
        long toplamGiderSayisi = giderRepository.countByKullaniciIdAndAyAndYil(kullaniciId, ay, yil);
        long anormalGiderSayisi = giderRepository.countAnormalByKullaniciId(kullaniciId);

        // Okunmamış uyarı sayısı
        long okunmamisUyariSayisi = uyariRepository.countOkunmamisByKullaniciId(kullaniciId);

        DashboardResponse dashboard = new DashboardResponse(
                ay,
                yil,
                toplamHarcama,
                nakitHarcama,
                krediKartiHarcama,
                oncekiAyHarcama,
                Math.round(degisimYuzdesi * 100.0) / 100.0,
                kategoriDagilimi,
                butceDurumlari,
                (int) toplamGiderSayisi,
                (int) anormalGiderSayisi,
                (int) okunmamisUyariSayisi
        );

        return ApiResponse.basarili(dashboard);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<GunlukHarcamaResponse>> getGunlukHarcamalar(
            Long kullaniciId, LocalDate baslangic, LocalDate bitis) {

        List<Object[]> gunlukVeriler = giderRepository.findGunlukToplamlar(kullaniciId, baslangic, bitis);

        List<GunlukHarcamaResponse> sonuclar = gunlukVeriler.stream()
                .map(satir -> new GunlukHarcamaResponse(
                        (LocalDate) satir[0],
                        (BigDecimal) satir[1]
                ))
                .collect(Collectors.toList());

        return ApiResponse.basarili(sonuclar);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<KategoriHarcamaResponse>> getKategoriDagilimi(Long kullaniciId, int ay, int yil) {
        BigDecimal toplamHarcama = giderRepository.findAylikToplam(kullaniciId, ay, yil);
        if (toplamHarcama == null) toplamHarcama = BigDecimal.ZERO;

        List<KategoriHarcamaResponse> dagilim = hesaplaKategoriDagilimi(kullaniciId, ay, yil, toplamHarcama);
        return ApiResponse.basarili(dagilim);
    }

    private List<KategoriHarcamaResponse> hesaplaKategoriDagilimi(
            Long kullaniciId, int ay, int yil, BigDecimal toplamHarcama) {

        List<Object[]> kategoriVerileri = giderRepository.findKategoriToplamlar(kullaniciId, ay, yil);

        return kategoriVerileri.stream().map(satir -> {
            Long kategoriId = (Long) satir[0];
            String kategoriAd = (String) satir[1];
            String kategoriIkon = (String) satir[2];
            String kategoriRenk = (String) satir[3];
            BigDecimal toplam = (BigDecimal) satir[4];

            double yuzde = 0.0;
            if (toplamHarcama.compareTo(BigDecimal.ZERO) > 0) {
                yuzde = toplam.divide(toplamHarcama, 4, RoundingMode.HALF_UP).doubleValue() * 100;
                yuzde = Math.round(yuzde * 100.0) / 100.0;
            }

            return new KategoriHarcamaResponse(kategoriId, kategoriAd, kategoriIkon, kategoriRenk, toplam, yuzde);
        }).collect(Collectors.toList());
    }
}
