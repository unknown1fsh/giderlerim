package com.scinar.giderlerim.zamanlayici;

import com.scinar.giderlerim.service.AbonelikService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/** Süresi dolan abonelikleri saat başı kapatır ve kullanıcı planlarını düşürür. */
@Slf4j
@Component
@RequiredArgsConstructor
public class AbonelikZamanlayici {

    private final AbonelikService abonelikService;

    @Scheduled(cron = "${abonelik.kontrol.cron:0 5 * * * *}", zone = "Europe/Istanbul")
    public void suresiDolanlariKapat() {
        try {
            abonelikService.suresiDolanlariIsle();
        } catch (RuntimeException e) {
            log.error("Abonelik süre kontrolü başarısız; bir sonraki çalışmada tekrar denenecek.", e);
        }
    }
}
