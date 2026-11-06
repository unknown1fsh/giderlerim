package com.scinar.giderlerim.dto.request;

import jakarta.validation.constraints.NotBlank;

public record TokenRequest(
        @NotBlank(message = "Token boş bırakılamaz")
        String token
) {}
