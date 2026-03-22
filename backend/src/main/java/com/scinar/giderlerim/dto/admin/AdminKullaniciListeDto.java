package com.scinar.giderlerim.dto.admin;

import com.scinar.giderlerim.entity.enums.ParaBirimi;
import com.scinar.giderlerim.entity.enums.PlanTuru;

import java.time.LocalDateTime;

public record AdminKullaniciListeDto(
        Long id,
        String ad,
        String soyad,
        String email,
        PlanTuru plan,
        ParaBirimi paraBirimi,
        Boolean adminMi,
        Boolean aktif,
        Boolean emailDogrulandi,
        LocalDateTime sonGirisTarihi,
        LocalDateTime createdAt,
        Long giderSayisi
) {}
