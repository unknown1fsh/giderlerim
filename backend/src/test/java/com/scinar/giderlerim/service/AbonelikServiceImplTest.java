package com.scinar.giderlerim.service;

import com.scinar.giderlerim.entity.Abonelik;
import com.scinar.giderlerim.entity.Kullanici;
import com.scinar.giderlerim.entity.ShopierSiparisi;
import com.scinar.giderlerim.entity.enums.AbonelikDonemi;
import com.scinar.giderlerim.entity.enums.AbonelikDurumu;
import com.scinar.giderlerim.entity.enums.AbonelikKaynagi;
import com.scinar.giderlerim.entity.enums.PlanTuru;
import com.scinar.giderlerim.repository.AbonelikRepository;
import com.scinar.giderlerim.repository.KullaniciRepository;
import com.scinar.giderlerim.service.impl.AbonelikServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.time.Clock;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class AbonelikServiceImplTest {

    private static final ZoneId IST = ZoneId.of("Europe/Istanbul");
    private static final LocalDateTime SIMDI = LocalDateTime.of(2026, 11, 7, 12, 0);

    private AbonelikRepository abonelikRepository;
    private KullaniciRepository kullaniciRepository;
    private AbonelikServiceImpl servis;
    private Kullanici kullanici;
    private List<Abonelik> kayitlar;

    @BeforeEach
    void kur() {
        abonelikRepository = mock(AbonelikRepository.class);
        kullaniciRepository = mock(KullaniciRepository.class);
        Clock saat = Clock.fixed(SIMDI.atZone(IST).toInstant(), IST);
        servis = new AbonelikServiceImpl(abonelikRepository, kullaniciRepository, saat);
        kullanici = Kullanici.builder().id(7L).email("a@b.com").plan(PlanTuru.FREE).build();

        // Repository'yi bellek içi listeyle taklit et.
        kayitlar = new ArrayList<>();
        when(abonelikRepository.save(any(Abonelik.class))).thenAnswer(inv -> {
            Abonelik a = inv.getArgument(0);
            kayitlar.add(a);
            return a;
        });
        when(abonelikRepository.findByKullaniciIdAndDurum(eq(7L), eq(AbonelikDurumu.AKTIF)))
                .thenAnswer(inv -> kayitlar.stream().filter(a -> a.getDurum() == AbonelikDurumu.AKTIF).toList());
        when(abonelikRepository.findUzatilabilir(eq(7L), any(), any())).thenAnswer(inv -> kayitlar.stream()
                .filter(a -> a.getPlan() == inv.getArgument(1) && a.getDurum() == AbonelikDurumu.AKTIF
                        && a.getBitis() != null && a.getBitis().isAfter(inv.getArgument(2)))
                .toList());
    }

    @Test
    void shopierAboneligiPlaniYukseltirVeDonemSonunuHesaplar() {
        Abonelik a = servis.shopierAboneligiBaslat(kullanici, PlanTuru.PREMIUM, AbonelikDonemi.AYLIK, new ShopierSiparisi());

        assertThat(a.getBaslangic()).isEqualTo(SIMDI);
        assertThat(a.getBitis()).isEqualTo(SIMDI.plusMonths(1));
        assertThat(a.getKaynak()).isEqualTo(AbonelikKaynagi.SHOPIER);
        assertThat(kullanici.getPlan()).isEqualTo(PlanTuru.PREMIUM);
        verify(kullaniciRepository).save(kullanici);
    }

    @Test
    void erkenYenilemeMevcutBitistenDevamEder() {
        servis.shopierAboneligiBaslat(kullanici, PlanTuru.PREMIUM, AbonelikDonemi.AYLIK, new ShopierSiparisi());
        Abonelik ikinci = servis.shopierAboneligiBaslat(kullanici, PlanTuru.PREMIUM, AbonelikDonemi.YILLIK, new ShopierSiparisi());

        assertThat(ikinci.getBaslangic()).isEqualTo(SIMDI.plusMonths(1));
        assertThat(ikinci.getBitis()).isEqualTo(SIMDI.plusMonths(1).plusYears(1));
    }

    @Test
    void etkinPlanAktifAboneliklerinEnYuksegidir() {
        servis.shopierAboneligiBaslat(kullanici, PlanTuru.PREMIUM, AbonelikDonemi.YILLIK, new ShopierSiparisi());
        servis.shopierAboneligiBaslat(kullanici, PlanTuru.ULTRA, AbonelikDonemi.AYLIK, new ShopierSiparisi());
        assertThat(kullanici.getPlan()).isEqualTo(PlanTuru.ULTRA);

        // Ultra iptal edilirse Premium hakkı devam eder.
        kayitlar.stream().filter(a -> a.getPlan() == PlanTuru.ULTRA).forEach(a -> a.setDurum(AbonelikDurumu.IPTAL));
        assertThat(servis.etkinPlaniGuncelle(kullanici)).isEqualTo(PlanTuru.PREMIUM);
    }

    @Test
    void suresiDolanAbonelikPlaniFreeYapar() {
        kullanici.setPlan(PlanTuru.PREMIUM);
        Abonelik dolan = Abonelik.builder().kullanici(kullanici).plan(PlanTuru.PREMIUM)
                .baslangic(SIMDI.minusMonths(1)).bitis(SIMDI.minusMinutes(1))
                .kaynak(AbonelikKaynagi.SHOPIER).durum(AbonelikDurumu.AKTIF).build();
        kayitlar.add(dolan);
        when(abonelikRepository.findSuresiDolanlar(SIMDI)).thenReturn(List.of(dolan));

        assertThat(servis.suresiDolanlariIsle()).isEqualTo(1);
        assertThat(dolan.getDurum()).isEqualTo(AbonelikDurumu.SURESI_DOLDU);
        assertThat(kullanici.getPlan()).isEqualTo(PlanTuru.FREE);
    }

    @Test
    void suresizAdminAboneligiDusurulmez() {
        servis.adminPlanAta(kullanici, PlanTuru.ULTRA);
        assertThat(kayitlar).singleElement().satisfies(a -> {
            assertThat(a.getBitis()).isNull();
            assertThat(a.getKaynak()).isEqualTo(AbonelikKaynagi.ADMIN);
        });
        when(abonelikRepository.findSuresiDolanlar(SIMDI)).thenReturn(List.of());

        assertThat(servis.suresiDolanlariIsle()).isZero();
        assertThat(kullanici.getPlan()).isEqualTo(PlanTuru.ULTRA);
    }

    @Test
    void adminFreeAtamasiTumAktifAbonelikleriIptalEder() {
        servis.shopierAboneligiBaslat(kullanici, PlanTuru.PREMIUM, AbonelikDonemi.AYLIK, new ShopierSiparisi());

        servis.adminPlanAta(kullanici, PlanTuru.FREE);

        assertThat(kayitlar).allMatch(a -> a.getDurum() == AbonelikDurumu.IPTAL);
        assertThat(kullanici.getPlan()).isEqualTo(PlanTuru.FREE);
    }

    @Test
    void siparisIadesiAboneligiIptalEderVePlaniDusurur() {
        ShopierSiparisi siparis = ShopierSiparisi.builder().id(99L).build();
        Abonelik a = servis.shopierAboneligiBaslat(kullanici, PlanTuru.PREMIUM, AbonelikDonemi.AYLIK, siparis);
        when(abonelikRepository.findBySiparisId(99L)).thenReturn(List.of(a));

        servis.siparisAbonelikleriniIptalEt(siparis);

        assertThat(a.getDurum()).isEqualTo(AbonelikDurumu.IPTAL);
        assertThat(kullanici.getPlan()).isEqualTo(PlanTuru.FREE);
        ArgumentCaptor<Kullanici> yakalanan = ArgumentCaptor.forClass(Kullanici.class);
        verify(kullaniciRepository, atLeastOnce()).save(yakalanan.capture());
    }
}
