package com.scinar.giderlerim.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SohbetMesajiRequest(
        @NotBlank(message = "Mesaj boş bırakılamaz")
        @Size(max = 2000, message = "Mesaj en fazla 2000 karakter olabilir")
        String icerik
) {}
