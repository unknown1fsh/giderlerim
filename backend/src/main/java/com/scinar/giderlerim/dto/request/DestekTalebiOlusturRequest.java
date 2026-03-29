package com.scinar.giderlerim.dto.request;

import com.scinar.giderlerim.entity.enums.DestekKategorisi;
import com.scinar.giderlerim.entity.enums.DestekOnceligi;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DestekTalebiOlusturRequest(
        @NotBlank(message = "Konu boş olamaz")
        @Size(max = 200, message = "Konu en fazla 200 karakter olabilir")
        String konu,

        @NotBlank(message = "Mesaj boş olamaz")
        String mesaj,

        DestekKategorisi kategori,

        DestekOnceligi oncelik
) {}
