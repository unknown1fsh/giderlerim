package com.scinar.giderlerim.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record SistemParametresiOlusturRequest(
        @NotBlank(message = "Anahtar boş olamaz")
        String anahtar,

        @NotBlank(message = "Değer boş olamaz")
        String deger,

        @NotBlank(message = "Varsayılan değer boş olamaz")
        String varsayilanDeger,

        String aciklama,

        @Pattern(regexp = "STRING|NUMBER|BOOLEAN", message = "Tip STRING, NUMBER veya BOOLEAN olmalıdır")
        String tip,

        @Pattern(regexp = "GENEL|GUVENLIK|AI|SISTEM|PLAN", message = "Kategori geçersiz")
        String kategori
) {}
