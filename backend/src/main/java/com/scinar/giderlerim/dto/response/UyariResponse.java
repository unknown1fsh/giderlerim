package com.scinar.giderlerim.dto.response;

import com.scinar.giderlerim.entity.enums.UyariTuru;

import java.time.LocalDateTime;

public record UyariResponse(
        Long id,
        UyariTuru tur,
        String baslik,
        String mesaj,
        boolean okunduMu,
        Long ilgiliId,
        LocalDateTime createdAt
) {}
