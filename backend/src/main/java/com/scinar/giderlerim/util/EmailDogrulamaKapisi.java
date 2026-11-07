package com.scinar.giderlerim.util;

import com.scinar.giderlerim.entity.Kullanici;
import com.scinar.giderlerim.exception.EmailDogrulamaGerekliException;

/** Yeni hesaplarda e-posta doğrulanana kadar yapay zeka ve dosya yüklemeyi kapatır. */
public final class EmailDogrulamaKapisi {

    private EmailDogrulamaKapisi() {}

    public static boolean dogrulamaBekleniyor(Kullanici kullanici) {
        return kullanici != null
                && Boolean.TRUE.equals(kullanici.getEmailDogrulamaZorunlu())
                && !Boolean.TRUE.equals(kullanici.getEmailDogrulandi());
    }

    public static void dogrula(Kullanici kullanici) {
        if (dogrulamaBekleniyor(kullanici)) {
            throw new EmailDogrulamaGerekliException();
        }
    }
}
