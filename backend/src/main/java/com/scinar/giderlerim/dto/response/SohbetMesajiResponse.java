package com.scinar.giderlerim.dto.response;

import com.scinar.giderlerim.entity.enums.MesajRolu;

import java.time.LocalDateTime;

public record SohbetMesajiResponse(
        Long id,
        MesajRolu rol,
        String icerik,
        LocalDateTime createdAt
) {}
