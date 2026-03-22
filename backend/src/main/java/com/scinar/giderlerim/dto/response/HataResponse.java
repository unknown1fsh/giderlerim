package com.scinar.giderlerim.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public record HataResponse(
        boolean success,
        String message,
        String hataKodu,
        List<AlanHatasi> alanHatalari,
        LocalDateTime zaman
) {
    public record AlanHatasi(String alan, String mesaj) {}

    public static HataResponse of(String hataKodu, String mesaj) {
        return new HataResponse(false, mesaj, hataKodu, null, LocalDateTime.now());
    }

    public static HataResponse dogrulamaHatasi(List<AlanHatasi> hatalar) {
        return new HataResponse(false, "Doğrulama hatası", "DOGRULAMA_HATASI", hatalar, LocalDateTime.now());
    }
}
