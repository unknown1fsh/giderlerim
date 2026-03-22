package com.scinar.giderlerim.dto.request;

import jakarta.validation.constraints.*;

public record KategoriOlusturRequest(
        @NotBlank(message = "Kategori adı boş bırakılamaz")
        @Size(max = 100)
        String ad,

        @Size(max = 50)
        String ikon,

        @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Geçerli bir HEX renk kodu giriniz")
        String renk
) {}
