package com.scinar.giderlerim.dto.admin;

import java.math.BigDecimal;

public record AdminIstatistikDto(
        // Kullanıcı istatistikleri
        long toplamKullanici,
        long aktifKullanici,
        long silinenKullanici,
        long adminKullanici,
        long freeKullanici,
        long premiumKullanici,
        long ultraKullanici,

        // Gider istatistikleri
        long toplamGiderSayisi,
        BigDecimal toplamGiderTutari,

        // Bütçe istatistikleri
        long toplamButceSayisi,

        // AI istatistikleri
        long toplamAiOturumSayisi,
        long toplamAiMesajSayisi,

        // Yükleme istatistikleri
        long toplamCsvYuklemeSayisi,
        long toplamBelgeYuklemeSayisi,

        // Uyarı istatistikleri
        long toplamUyariSayisi,
        long okunmamisUyariSayisi
) {}
