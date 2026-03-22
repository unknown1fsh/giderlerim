package com.scinar.giderlerim.dto.request;

import jakarta.validation.constraints.*;

public record KayitRequest(
        @NotBlank(message = "Ad alanı boş bırakılamaz")
        @Size(max = 100, message = "Ad en fazla 100 karakter olabilir")
        String ad,

        @NotBlank(message = "Soyad alanı boş bırakılamaz")
        @Size(max = 100, message = "Soyad en fazla 100 karakter olabilir")
        String soyad,

        @NotBlank(message = "E-posta alanı boş bırakılamaz")
        @Email(message = "Geçerli bir e-posta adresi giriniz")
        @Size(max = 255, message = "E-posta en fazla 255 karakter olabilir")
        String email,

        @NotBlank(message = "Şifre alanı boş bırakılamaz")
        @Size(min = 8, message = "Şifre en az 8 karakter olmalıdır")
        String sifre
) {}
