package com.scinar.giderlerim.dto.admin;

import java.time.LocalDateTime;

public record SistemParametresiDto(
        Long id,
        String anahtar,
        String deger,
        String varsayilanDeger,
        String aciklama,
        String tip,
        String kategori,
        Boolean duzenlenebilir,
        LocalDateTime updatedAt
) {}
