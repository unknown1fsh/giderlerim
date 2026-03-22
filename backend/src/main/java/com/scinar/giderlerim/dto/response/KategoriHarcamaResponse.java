package com.scinar.giderlerim.dto.response;

import java.math.BigDecimal;

public record KategoriHarcamaResponse(
        Long kategoriId,
        String kategoriAd,
        String kategoriIkon,
        String kategoriRenk,
        BigDecimal toplam,
        double yuzde
) {}
