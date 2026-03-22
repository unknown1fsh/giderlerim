package com.scinar.giderlerim.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

public record GunlukHarcamaResponse(LocalDate tarih, BigDecimal toplam) {}
