package com.scinar.giderlerim.dto.request;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record ButceOlusturRequest(
        @NotNull(message = "Kategori seçimi zorunludur")
        Long kategoriId,

        @NotNull(message = "Ay bilgisi zorunludur")
        @Min(value = 1) @Max(value = 12)
        Integer ay,

        @NotNull(message = "Yıl bilgisi zorunludur")
        Integer yil,

        @NotNull(message = "Limit tutar zorunludur")
        @DecimalMin(value = "1.00", message = "Limit en az 1 TL olmalıdır")
        BigDecimal limitTutar,

        @Min(value = 1) @Max(value = 100)
        Integer uyariYuzdesi
) {}
