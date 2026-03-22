package com.scinar.giderlerim.dto.request;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record ButceGuncelleRequest(
        @DecimalMin(value = "1.00")
        BigDecimal limitTutar,

        @Min(1) @Max(100)
        Integer uyariYuzdesi
) {}
