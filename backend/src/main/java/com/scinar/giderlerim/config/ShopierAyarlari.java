package com.scinar.giderlerim.config;

import com.scinar.giderlerim.entity.enums.AbonelikDonemi;
import com.scinar.giderlerim.entity.enums.PlanTuru;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;

/**
 * Shopier ürün kimliği → plan/dönem/beklenen fiyat eşlemesi.
 * Örnek: {@code shopier.urunler.46065275.plan=PREMIUM}, {@code .donem=AYLIK}, {@code .fiyat=99.00}
 */
@ConfigurationProperties(prefix = "shopier")
public record ShopierAyarlari(Map<String, UrunTanimi> urunler) {

    public ShopierAyarlari {
        urunler = urunler == null ? Map.of() : Map.copyOf(urunler);
    }

    public Optional<UrunTanimi> urun(String urunId) {
        return urunId == null ? Optional.empty() : Optional.ofNullable(urunler.get(urunId.trim()));
    }

    public record UrunTanimi(PlanTuru plan, AbonelikDonemi donem, BigDecimal fiyat) {}
}
