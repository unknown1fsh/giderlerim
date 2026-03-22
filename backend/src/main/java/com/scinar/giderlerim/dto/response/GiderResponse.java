package com.scinar.giderlerim.dto.response;

import com.scinar.giderlerim.entity.enums.GirisTuru;
import com.scinar.giderlerim.entity.enums.OdemeYontemi;
import com.scinar.giderlerim.entity.enums.ParaBirimi;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record GiderResponse(
        Long id,
        KategoriResponse kategori,
        BigDecimal tutar,
        ParaBirimi paraBirimi,
        String aciklama,
        String notlar,
        LocalDate tarih,
        OdemeYontemi odemeYontemi,
        GirisTuru girisTuru,
        boolean aiKategorilendi,
        boolean anormalMi,
        LocalDateTime createdAt
) {}
