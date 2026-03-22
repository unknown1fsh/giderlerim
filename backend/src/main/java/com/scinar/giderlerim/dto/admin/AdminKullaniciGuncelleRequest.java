package com.scinar.giderlerim.dto.admin;

import com.scinar.giderlerim.entity.enums.PlanTuru;

public record AdminKullaniciGuncelleRequest(
        PlanTuru plan,
        Boolean adminMi,
        Boolean aktif
) {}
