package com.scinar.giderlerim.dto.response;

import com.scinar.giderlerim.entity.enums.YuklemeDurumu;

import java.time.LocalDateTime;

public record CsvYuklemeResponse(
        Long id,
        String dosyaAdi,
        YuklemeDurumu durum,
        int toplamSatir,
        int islenenSatir,
        String hataMesaji,
        LocalDateTime createdAt
) {}
