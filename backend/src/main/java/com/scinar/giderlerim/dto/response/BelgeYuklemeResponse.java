package com.scinar.giderlerim.dto.response;

import com.scinar.giderlerim.entity.enums.YuklemeDurumu;

import java.time.LocalDateTime;

public record BelgeYuklemeResponse(
        Long id,
        String dosyaAdi,
        String dosyaTuru,
        YuklemeDurumu durum,
        int toplamSatir,
        int islenenSatir,
        String hataMesaji,
        LocalDateTime createdAt
) {}
