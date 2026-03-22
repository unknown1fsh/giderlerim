package com.scinar.giderlerim.dto.request;

import com.scinar.giderlerim.entity.enums.ParaBirimi;
import jakarta.validation.constraints.Size;

public record ProfilGuncelleRequest(
        @Size(max = 100) String ad,
        @Size(max = 100) String soyad,
        ParaBirimi paraBirimi
) {}
