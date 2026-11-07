package com.scinar.giderlerim.entity.enums;

import java.time.LocalDateTime;

public enum AbonelikDonemi {
    AYLIK, YILLIK;

    public LocalDateTime bitisHesapla(LocalDateTime baslangic) {
        return this == AYLIK ? baslangic.plusMonths(1) : baslangic.plusYears(1);
    }
}
