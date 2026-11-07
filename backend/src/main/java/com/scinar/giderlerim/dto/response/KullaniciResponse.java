package com.scinar.giderlerim.dto.response;

import com.scinar.giderlerim.entity.enums.ParaBirimi;
import com.scinar.giderlerim.entity.enums.PlanTuru;

public record KullaniciResponse(
        Long id,
        String ad,
        String soyad,
        String email,
        PlanTuru plan,
        ParaBirimi paraBirimi,
        String avatarUrl,
        Boolean adminMi,
        Boolean aiIzni,
        Boolean emailDogrulandi,
        /** TRUE ise e-posta doğrulanana kadar yapay zeka ve dosya yükleme kapalıdır. */
        Boolean emailDogrulamaGerekli
) {}
