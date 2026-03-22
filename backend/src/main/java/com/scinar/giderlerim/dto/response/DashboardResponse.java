package com.scinar.giderlerim.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record DashboardResponse(
        int ay,
        int yil,
        BigDecimal toplamHarcama,
        BigDecimal nakitHarcama,
        BigDecimal krediKartiHarcama,
        BigDecimal oncekiAyHarcama,
        double degisimYuzdesi,
        List<KategoriHarcamaResponse> kategoriDagilimi,
        List<ButceOzetResponse> butceDurumlari,
        int toplamGiderSayisi,
        int anormalGiderSayisi,
        int okunmamisUyariSayisi
) {}
