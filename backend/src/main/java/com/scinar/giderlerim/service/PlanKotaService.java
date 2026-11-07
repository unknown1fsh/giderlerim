package com.scinar.giderlerim.service;

import com.scinar.giderlerim.entity.Kullanici;

/**
 * Plan limitlerinin tek kaynağı. Ücretsiz plandaki aylık gider hakkı, giderin tarih alanına göre değil
 * <b>giriş zamanına</b> (created_at) göre sayılır; böylece tarihi başka aya yazmak veya güncellemek limiti aşmaz.
 */
public interface PlanKotaService {

    /** Bu ay eklenebilecek gider sayısı; sınırsız planlarda {@link Integer#MAX_VALUE}. */
    int kalanGiderHakki(Kullanici kullanici);

    /** {@code adet} gider eklenemiyorsa PlanLimitiAsimException fırlatır. */
    void giderEklemeKontrol(Kullanici kullanici, int adet);

    /** Toplu içe aktarmada, limit nedeniyle eklenebilecek en fazla satır sayısı (0 ise hiç). */
    default int iceAktarilabilir(Kullanici kullanici, int istenen) {
        return Math.min(istenen, kalanGiderHakki(kullanici));
    }
}
