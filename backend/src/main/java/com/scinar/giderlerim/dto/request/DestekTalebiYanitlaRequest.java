package com.scinar.giderlerim.dto.request;

import com.scinar.giderlerim.entity.enums.DestekDurumu;
import jakarta.validation.constraints.NotBlank;

public record DestekTalebiYanitlaRequest(
        @NotBlank(message = "Yanıt boş olamaz")
        String adminYaniti,

        DestekDurumu durum
) {}
