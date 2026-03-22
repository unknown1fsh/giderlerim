package com.scinar.giderlerim.dto.admin;

import jakarta.validation.constraints.NotBlank;

public record SistemParametresiGuncelleRequest(
        @NotBlank(message = "Değer boş olamaz")
        String deger
) {}
