package com.scinar.giderlerim.service.impl;

import com.scinar.giderlerim.entity.Abonelik;
import com.scinar.giderlerim.entity.Kullanici;
import com.scinar.giderlerim.entity.ShopierSiparisi;
import com.scinar.giderlerim.entity.enums.AbonelikDonemi;
import com.scinar.giderlerim.entity.enums.AbonelikDurumu;
import com.scinar.giderlerim.entity.enums.AbonelikKaynagi;
import com.scinar.giderlerim.entity.enums.PlanTuru;
import com.scinar.giderlerim.repository.AbonelikRepository;
import com.scinar.giderlerim.repository.KullaniciRepository;
import com.scinar.giderlerim.service.AbonelikService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AbonelikServiceImpl implements AbonelikService {

    private final AbonelikRepository abonelikRepository;
    private final KullaniciRepository kullaniciRepository;
    private final Clock saat;

    @Override
    @Transactional
    public Abonelik shopierAboneligiBaslat(Kullanici kullanici, PlanTuru plan, AbonelikDonemi donem,
                                           ShopierSiparisi siparis) {
        LocalDateTime simdi = LocalDateTime.now(saat);
        // Aynı plandan süresi dolmamış abonelik varsa yeni dönem onun bitişinden başlar (erken yenileme kaybolmaz).
        LocalDateTime baslangic = abonelikRepository.findUzatilabilir(kullanici.getId(), plan, simdi).stream()
                .findFirst()
                .map(Abonelik::getBitis)
                .orElse(simdi);

        Abonelik abonelik = abonelikRepository.save(Abonelik.builder()
                .kullanici(kullanici)
                .plan(plan)
                .baslangic(baslangic)
                .bitis(donem.bitisHesapla(baslangic))
                .kaynak(AbonelikKaynagi.SHOPIER)
                .siparis(siparis)
                .durum(AbonelikDurumu.AKTIF)
                .build());

        etkinPlaniGuncelle(kullanici);
        log.info("Shopier aboneliği başlatıldı. Kullanıcı: {}, plan: {}, bitiş: {}",
                kullanici.getId(), plan, abonelik.getBitis());
        return abonelik;
    }

    @Override
    @Transactional
    public void siparisAbonelikleriniIptalEt(ShopierSiparisi siparis) {
        List<Abonelik> abonelikler = abonelikRepository.findBySiparisId(siparis.getId());
        abonelikler.stream()
                .filter(a -> a.getDurum() == AbonelikDurumu.AKTIF)
                .forEach(a -> a.setDurum(AbonelikDurumu.IPTAL));
        abonelikler.stream()
                .map(Abonelik::getKullanici)
                .distinct()
                .forEach(this::etkinPlaniGuncelle);
    }

    @Override
    @Transactional
    public void adminPlanAta(Kullanici kullanici, PlanTuru plan) {
        List<Abonelik> iptalEdilecekler = plan == PlanTuru.FREE
                ? abonelikRepository.findByKullaniciIdAndDurum(kullanici.getId(), AbonelikDurumu.AKTIF)
                : abonelikRepository.findByKullaniciIdAndDurumAndKaynak(
                        kullanici.getId(), AbonelikDurumu.AKTIF, AbonelikKaynagi.ADMIN);
        iptalEdilecekler.forEach(a -> a.setDurum(AbonelikDurumu.IPTAL));

        if (plan != PlanTuru.FREE) {
            abonelikRepository.save(Abonelik.builder()
                    .kullanici(kullanici)
                    .plan(plan)
                    .baslangic(LocalDateTime.now(saat))
                    .bitis(null)
                    .kaynak(AbonelikKaynagi.ADMIN)
                    .durum(AbonelikDurumu.AKTIF)
                    .build());
        }
        etkinPlaniGuncelle(kullanici);
    }

    @Override
    @Transactional
    public int suresiDolanlariIsle() {
        List<Abonelik> dolanlar = abonelikRepository.findSuresiDolanlar(LocalDateTime.now(saat));
        if (dolanlar.isEmpty()) {
            return 0;
        }
        Map<Long, Kullanici> etkilenenler = new LinkedHashMap<>();
        for (Abonelik abonelik : dolanlar) {
            abonelik.setDurum(AbonelikDurumu.SURESI_DOLDU);
            etkilenenler.putIfAbsent(abonelik.getKullanici().getId(), abonelik.getKullanici());
        }
        abonelikRepository.flush();
        etkilenenler.values().forEach(this::etkinPlaniGuncelle);
        log.info("{} aboneliğin süresi doldu; {} kullanıcının planı yeniden hesaplandı.",
                dolanlar.size(), etkilenenler.size());
        return dolanlar.size();
    }

    @Override
    @Transactional
    public PlanTuru etkinPlaniGuncelle(Kullanici kullanici) {
        LocalDateTime simdi = LocalDateTime.now(saat);
        PlanTuru etkinPlan = abonelikRepository.findByKullaniciIdAndDurum(kullanici.getId(), AbonelikDurumu.AKTIF)
                .stream()
                .filter(a -> a.gecerli(simdi))
                .map(Abonelik::getPlan)
                .max(Comparator.comparing(PlanTuru::ordinal))
                .orElse(PlanTuru.FREE);

        if (kullanici.getPlan() != etkinPlan) {
            log.info("Kullanıcı planı değişti. Kullanıcı: {}, {} -> {}", kullanici.getId(), kullanici.getPlan(), etkinPlan);
            kullanici.setPlan(etkinPlan);
            kullaniciRepository.save(kullanici);
        }
        return etkinPlan;
    }
}
