package com.scinar.giderlerim.dto.response;

import java.time.LocalDateTime;

public record SohbetOturumResponse(
        Long id,
        String baslik,
        boolean aktif,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
