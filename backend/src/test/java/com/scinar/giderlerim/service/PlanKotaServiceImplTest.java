package com.scinar.giderlerim.service;

import com.scinar.giderlerim.entity.Kullanici;
import com.scinar.giderlerim.entity.enums.PlanTuru;
import com.scinar.giderlerim.exception.PlanLimitiAsimException;
import com.scinar.giderlerim.repository.GiderRepository;
import com.scinar.giderlerim.service.impl.PlanKotaServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class PlanKotaServiceImplTest {

    private GiderRepository giderRepository;
    private SistemParametresiDegerService parametreler;
    private PlanKotaServiceImpl servis;

    @BeforeEach
    void kur() {
        giderRepository = mock(GiderRepository.class);
        parametreler = mock(SistemParametresiDegerService.class);
        when(parametreler.pozitifTamSayi(eq("ucretsiz.plan.aylik.gider.limiti"), anyInt())).thenReturn(3);
        servis = new PlanKotaServiceImpl(giderRepository, parametreler);
    }

    private static Kullanici kullanici(PlanTuru plan) {
        return Kullanici.builder().id(9L).plan(plan).build();
    }

    @Test
    void ucretliPlanlardaSinirYok() {
        assertThat(servis.kalanGiderHakki(kullanici(PlanTuru.PREMIUM))).isEqualTo(Integer.MAX_VALUE);
        assertThat(servis.kalanGiderHakki(kullanici(PlanTuru.ULTRA))).isEqualTo(Integer.MAX_VALUE);
        verifyNoInteractions(giderRepository);
    }

    @Test
    void ucretsizPlandaGirisZamaninaGoreBuAykiAralikSayilir() {
        when(giderRepository.countByKullaniciIdAndCreatedAtBetween(anyLong(), any(), any())).thenReturn(1L);

        assertThat(servis.kalanGiderHakki(kullanici(PlanTuru.FREE))).isEqualTo(2);

        ArgumentCaptor<LocalDateTime> baslangic = ArgumentCaptor.forClass(LocalDateTime.class);
        ArgumentCaptor<LocalDateTime> bitis = ArgumentCaptor.forClass(LocalDateTime.class);
        verify(giderRepository).countByKullaniciIdAndCreatedAtBetween(eq(9L), baslangic.capture(), bitis.capture());
        LocalDateTime ayBasi = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        assertThat(baslangic.getValue()).isEqualTo(ayBasi);
        assertThat(bitis.getValue()).isEqualTo(ayBasi.plusMonths(1));
    }

    @Test
    void hakDolunca402IcinPlanLimitiAsimFirlatilir() {
        when(giderRepository.countByKullaniciIdAndCreatedAtBetween(anyLong(), any(), any())).thenReturn(3L);

        assertThat(servis.kalanGiderHakki(kullanici(PlanTuru.FREE))).isZero();
        assertThatThrownBy(() -> servis.giderEklemeKontrol(kullanici(PlanTuru.FREE), 1))
                .isInstanceOf(PlanLimitiAsimException.class)
                .hasMessageContaining("ayda 3 gider");
    }

    @Test
    void iceAktarmaKalanHakKadarSatirKabulEder() {
        when(giderRepository.countByKullaniciIdAndCreatedAtBetween(anyLong(), any(), any())).thenReturn(1L);

        assertThat(servis.iceAktarilabilir(kullanici(PlanTuru.FREE), 10)).isEqualTo(2);
        assertThat(servis.iceAktarilabilir(kullanici(PlanTuru.FREE), 1)).isEqualTo(1);
        assertThatCode(() -> servis.giderEklemeKontrol(kullanici(PlanTuru.FREE), 2)).doesNotThrowAnyException();
    }

    @Test
    void sayacEksiyeDusmez() {
        when(giderRepository.countByKullaniciIdAndCreatedAtBetween(anyLong(), any(), any())).thenReturn(10L);
        assertThat(servis.kalanGiderHakki(kullanici(PlanTuru.FREE))).isZero();
    }
}
