package com.scinar.giderlerim.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "butceler")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Butce {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "kullanici_id", nullable = false)
    private Kullanici kullanici;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "kategori_id", nullable = false)
    private Kategori kategori;

    @Column(nullable = false)
    private int ay;

    @Column(nullable = false)
    private int yil;

    @Column(name = "limit_tutar", nullable = false, precision = 15, scale = 2)
    private BigDecimal limitTutar;

    @Column(name = "uyari_yuzdesi", nullable = false)
    @Builder.Default
    private int uyariYuzdesi = 80;

    @Column(nullable = false)
    @Builder.Default
    private Boolean aktif = true;

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
