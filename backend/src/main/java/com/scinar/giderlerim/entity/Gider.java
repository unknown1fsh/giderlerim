package com.scinar.giderlerim.entity;

import com.scinar.giderlerim.entity.enums.GirisTuru;
import com.scinar.giderlerim.entity.enums.OdemeYontemi;
import com.scinar.giderlerim.entity.enums.ParaBirimi;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "giderler")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Gider {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "kullanici_id", nullable = false)
    private Kullanici kullanici;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "kategori_id", nullable = false)
    private Kategori kategori;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal tutar;

    @Enumerated(EnumType.STRING)
    @Column(name = "para_birimi", columnDefinition = "para_birimi", nullable = false)
    @Builder.Default
    private ParaBirimi paraBirimi = ParaBirimi.TRY;

    @Column(length = 500)
    private String aciklama;

    @Column(columnDefinition = "TEXT")
    private String notlar;

    @Column(nullable = false)
    private LocalDate tarih;

    @Enumerated(EnumType.STRING)
    @Column(name = "odeme_yontemi", columnDefinition = "odeme_yontemi", nullable = false)
    @Builder.Default
    private OdemeYontemi odemeYontemi = OdemeYontemi.NAKIT;

    @Enumerated(EnumType.STRING)
    @Column(name = "giris_turu", columnDefinition = "giris_turu", nullable = false)
    @Builder.Default
    private GirisTuru girisTuru = GirisTuru.MANUEL;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "csv_yukleme_id")
    private CsvYukleme csvYukleme;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "belge_yukleme_id")
    private BelgeYukleme belgeYukleme;

    @Column(name = "ai_kategorilendi", nullable = false)
    @Builder.Default
    private Boolean aiKategorilendi = false;

    @Column(name = "ai_guven_skoru", precision = 3, scale = 2)
    private BigDecimal aiGuvenSkoru;

    @Column(name = "anormal_mi", nullable = false)
    @Builder.Default
    private Boolean anormalMi = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime simdi = LocalDateTime.now();
        this.createdAt = simdi;
        this.updatedAt = simdi;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
