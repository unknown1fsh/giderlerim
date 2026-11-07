package com.scinar.giderlerim.service;

import com.scinar.giderlerim.entity.Abonelik;
import com.scinar.giderlerim.entity.Kullanici;
import com.scinar.giderlerim.entity.ShopierSiparisi;
import com.scinar.giderlerim.entity.enums.AbonelikDonemi;
import com.scinar.giderlerim.entity.enums.PlanTuru;

public interface AbonelikService {

    /** Ödenmiş Shopier siparişi için abonelik başlatır; aynı plan aktifse bitişi uzatır. */
    Abonelik shopierAboneligiBaslat(Kullanici kullanici, PlanTuru plan, AbonelikDonemi donem, ShopierSiparisi siparis);

    /** Siparişe bağlı abonelikleri iptal eder (iade). */
    void siparisAbonelikleriniIptalEt(ShopierSiparisi siparis);

    /**
     * Admin plan ataması: FREE tüm aktif abonelikleri iptal eder;
     * ücretli plan önceki admin atamalarını değiştirir ve süresiz admin aboneliği oluşturur.
     */
    void adminPlanAta(Kullanici kullanici, PlanTuru plan);

    /** Süresi dolan abonelikleri kapatır ve etkilenen kullanıcıların planını yeniden hesaplar. İşlenen sayıyı döner. */
    int suresiDolanlariIsle();

    /** Kullanıcının etkin planını aktif aboneliklerden hesaplayıp kullanıcıya yazar. */
    PlanTuru etkinPlaniGuncelle(Kullanici kullanici);
}
