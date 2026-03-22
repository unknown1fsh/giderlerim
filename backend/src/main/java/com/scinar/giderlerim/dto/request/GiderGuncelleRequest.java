package com.scinar.giderlerim.dto.request;

import com.scinar.giderlerim.entity.enums.OdemeYontemi;
import com.scinar.giderlerim.entity.enums.ParaBirimi;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public record GiderGuncelleRequest(
        Long kategoriId,

        @DecimalMin(value = "0.01", message = "Tutar sıfırdan büyük olmalıdır")
        BigDecimal tutar,

        ParaBirimi paraBirimi,
        String aciklama,
        String notlar,
        LocalDate tarih,
        OdemeYontemi odemeYontemi
) {}
