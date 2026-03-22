package com.scinar.giderlerim.dto.response;

public record KategoriResponse(
        Long id,
        String ad,
        String ikon,
        String renk,
        boolean sistemMi
) {}
