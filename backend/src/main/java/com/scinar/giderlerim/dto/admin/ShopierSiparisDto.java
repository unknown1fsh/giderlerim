package com.scinar.giderlerim.dto.admin;

import com.scinar.giderlerim.entity.enums.AbonelikDonemi;
import com.scinar.giderlerim.entity.enums.PlanTuru;
import com.scinar.giderlerim.entity.enums.SiparisDurumu;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ShopierSiparisDto(
        Long id,
        String shopierSiparisId,
        String urunId,
        PlanTuru plan,
        AbonelikDonemi donem,
        BigDecimal tutar,
        String paraBirimi,
        String aliciEmail,
        Long kullaniciId,
        String kullaniciEmail,
        SiparisDurumu durum,
        String aciklama,
        LocalDateTime createdAt
) {}
