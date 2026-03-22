package com.scinar.giderlerim.dto.response;

import java.math.BigDecimal;

public record ButceResponse(
        Long id,
        KategoriResponse kategori,
        int ay,
        int yil,
        BigDecimal limitTutar,
        int uyariYuzdesi,
        boolean aktif
) {}
