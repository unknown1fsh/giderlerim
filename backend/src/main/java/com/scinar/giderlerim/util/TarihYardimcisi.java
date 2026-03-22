package com.scinar.giderlerim.util;

import java.time.LocalDate;

public final class TarihYardimcisi {

    private TarihYardimcisi() {}

    public static LocalDate ayBaslangici(int ay, int yil) {
        return LocalDate.of(yil, ay, 1);
    }

    public static LocalDate ayBitisi(int ay, int yil) {
        return LocalDate.of(yil, ay, 1).withDayOfMonth(
                LocalDate.of(yil, ay, 1).lengthOfMonth()
        );
    }

    public static int mevcutAy() {
        return LocalDate.now().getMonthValue();
    }

    public static int mevcutYil() {
        return LocalDate.now().getYear();
    }
}
