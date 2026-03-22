package com.scinar.giderlerim.dto.response;

import java.util.List;

public record SayfaliResponse<T>(
        List<T> icerik,
        int sayfa,
        int boyut,
        long toplamEleman,
        int toplamSayfa,
        boolean sonSayfa
) {}
