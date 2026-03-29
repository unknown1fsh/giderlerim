package com.scinar.giderlerim.dto.response;

import com.scinar.giderlerim.entity.enums.DestekDurumu;
import com.scinar.giderlerim.entity.enums.DestekKategorisi;
import com.scinar.giderlerim.entity.enums.DestekOnceligi;

import java.time.LocalDateTime;

public record DestekTalebiResponse(
        Long id,
        String konu,
        String mesaj,
        DestekDurumu durum,
        DestekOnceligi oncelik,
        DestekKategorisi kategori,
        String adminYaniti,
        String yanitlayanAdminAdi,
        LocalDateTime yanitlanmaTarihi,
        String kullaniciAdi,
        String kullaniciEmail,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
