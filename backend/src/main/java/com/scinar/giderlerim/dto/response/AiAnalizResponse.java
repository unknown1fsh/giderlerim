package com.scinar.giderlerim.dto.response;

import com.scinar.giderlerim.entity.enums.AnalizTuru;

import java.time.LocalDateTime;
import java.util.List;

public record AiAnalizResponse(
        AnalizTuru tur,
        String ozet,
        List<String> bulgular,
        List<String> oneriler,
        String oncelikliEylem,
        LocalDateTime olusturmaTarihi,
        boolean onbellekten
) {}
