package com.scinar.giderlerim.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SifreSifirlaRequest(
        @NotBlank(message = "Token boş bırakılamaz")
        String token,
        @NotBlank(message = "Şifre alanı boş bırakılamaz")
        @Size(min = 8, message = "Şifre en az 8 karakter olmalıdır")
        String yeniSifre
) {}
