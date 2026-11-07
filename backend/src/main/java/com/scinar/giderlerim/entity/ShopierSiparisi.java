package com.scinar.giderlerim.entity;

import com.scinar.giderlerim.entity.enums.AbonelikDonemi;
import com.scinar.giderlerim.entity.enums.PlanTuru;
import com.scinar.giderlerim.entity.enums.SiparisDurumu;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** Shopier'den gelen ve işlenen sipariş; alıcının yalnızca e-postası saklanır. */
@Entity
@Table(name = "shopier_siparisleri")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShopierSiparisi {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "shopier_siparis_id", nullable = false, unique = true, length = 100)
    private String shopierSiparisId;

    @Column(name = "urun_id", length = 50)
    private String urunId;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private PlanTuru plan;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private AbonelikDonemi donem;

    @Column(precision = 15, scale = 2)
    private BigDecimal tutar;

    @Column(name = "para_birimi", length = 3)
    private String paraBirimi;

    @Column(name = "alici_email")
    private String aliciEmail;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "kullanici_id")
    private Kullanici kullanici;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private SiparisDurumu durum;

    @Column(length = 500)
    private String aciklama;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void olusturuldu() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    void guncellendi() {
        updatedAt = LocalDateTime.now();
    }
}
