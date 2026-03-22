package com.scinar.giderlerim.dto.request;

import com.scinar.giderlerim.entity.enums.OdemeYontemi;
import com.scinar.giderlerim.entity.enums.ParaBirimi;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public record GiderOlusturRequest(
        @NotNull(message = "Kategori seçimi zorunludur")
        Long kategoriId,

        @NotNull(message = "Tutar alanı boş bırakılamaz")
        @DecimalMin(value = "0.01", message = "Tutar sıfırdan büyük olmalıdır")
        @Digits(integer = 13, fraction = 2, message = "Geçersiz tutar formatı")
        BigDecimal tutar,

        ParaBirimi paraBirimi,

        @Size(max = 500, message = "Açıklama en fazla 500 karakter olabilir")
        String aciklama,

        String notlar,

        @NotNull(message = "Tarih alanı zorunludur")
        LocalDate tarih,

        OdemeYontemi odemeYontemi
) {}
