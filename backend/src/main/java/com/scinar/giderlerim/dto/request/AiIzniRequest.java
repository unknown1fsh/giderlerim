package com.scinar.giderlerim.dto.request;

import jakarta.validation.constraints.NotNull;

public record AiIzniRequest(
        @NotNull(message = "İzin değeri zorunludur")
        Boolean izin
) {}
