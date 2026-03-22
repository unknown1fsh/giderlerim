package com.scinar.giderlerim.dto.response;

import java.math.BigDecimal;

public record ButceOzetResponse(
        Long butceId,
        KategoriResponse kategori,
        BigDecimal limitTutar,
        BigDecimal harcananTutar,
        BigDecimal kalanTutar,
        int kullanimYuzdesi,
        boolean limitAsildi,
        boolean uyariEsigi
) {}
