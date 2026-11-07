package com.scinar.giderlerim.util;

import com.scinar.giderlerim.entity.Kullanici;
import com.scinar.giderlerim.exception.AiIzniGerekliException;

/** Yapay zeka sağlayıcısına veri gönderen her akışın başında çağrılır. */
public final class AiIzinKapisi {

    /** Rıza metni değiştiğinde artırılır; kayıtlı izinlerin hangi metne verildiği izlenir. */
    public static final String METIN_SURUMU = "2026-11-v1";

    private AiIzinKapisi() {}

    public static void dogrula(Kullanici kullanici) {
        EmailDogrulamaKapisi.dogrula(kullanici);
        if (kullanici == null || !Boolean.TRUE.equals(kullanici.getAiIzni())) {
            throw new AiIzniGerekliException();
        }
    }
}
