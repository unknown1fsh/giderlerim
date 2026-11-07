package com.scinar.giderlerim.service.impl;

import com.scinar.giderlerim.entity.Kullanici;
import com.scinar.giderlerim.entity.enums.PlanTuru;
import com.scinar.giderlerim.exception.PlanLimitiAsimException;
import com.scinar.giderlerim.repository.GiderRepository;
import com.scinar.giderlerim.service.PlanKotaService;
import com.scinar.giderlerim.service.SistemParametresiDegerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PlanKotaServiceImpl implements PlanKotaService {

    static final String FREE_AYLIK_GIDER_LIMITI = "ucretsiz.plan.aylik.gider.limiti";
    private static final int VARSAYILAN_FREE_LIMIT = 50;

    private final GiderRepository giderRepository;
    private final SistemParametresiDegerService parametreler;

    @Override
    @Transactional(readOnly = true)
    public int kalanGiderHakki(Kullanici kullanici) {
        if (kullanici.getPlan() != PlanTuru.FREE) {
            return Integer.MAX_VALUE;
        }
        int limit = parametreler.pozitifTamSayi(FREE_AYLIK_GIDER_LIMITI, VARSAYILAN_FREE_LIMIT);
        // created_at sunucu saatinde (LocalDateTime.now()) yazıldığı için ay sınırı da aynı saatle hesaplanır.
        // Saat dilimi birliği #45 kapsamında ele alınacak.
        LocalDate bugun = LocalDate.now();
        LocalDateTime ayBasi = bugun.withDayOfMonth(1).atStartOfDay();
        long kullanilan = giderRepository.countByKullaniciIdAndCreatedAtBetween(
                kullanici.getId(), ayBasi, ayBasi.plusMonths(1));
        return (int) Math.max(0, limit - kullanilan);
    }

    @Override
    @Transactional(readOnly = true)
    public void giderEklemeKontrol(Kullanici kullanici, int adet) {
        if (kalanGiderHakki(kullanici) < adet) {
            int limit = parametreler.pozitifTamSayi(FREE_AYLIK_GIDER_LIMITI, VARSAYILAN_FREE_LIMIT);
            throw new PlanLimitiAsimException(
                    "Ücretsiz planda ayda " + limit + " gider ekleyebilirsiniz ve bu ayki hakkınız doldu. "
                            + "Pro'ya geçerek sınırsız gider ekleyebilirsiniz.");
        }
    }
}
