package com.scinar.giderlerim.entity;

import com.scinar.giderlerim.entity.enums.DestekDurumu;
import com.scinar.giderlerim.entity.enums.DestekKategorisi;
import com.scinar.giderlerim.entity.enums.DestekOnceligi;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "destek_talepleri")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DestekTalebi {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "kullanici_id", nullable = false)
    private Kullanici kullanici;

    @Column(nullable = false, length = 200)
    private String konu;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String mesaj;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "destek_durumu", nullable = false)
    @Builder.Default
    private DestekDurumu durum = DestekDurumu.ACIK;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "destek_onceligi", nullable = false)
    @Builder.Default
    private DestekOnceligi oncelik = DestekOnceligi.NORMAL;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "destek_kategorisi", nullable = false)
    @Builder.Default
    private DestekKategorisi kategori = DestekKategorisi.GENEL;

    @Column(name = "admin_yaniti", columnDefinition = "TEXT")
    private String adminYaniti;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "yanitlayan_admin_id")
    private Kullanici yanitlayanAdmin;

    @Column(name = "yanitlanma_tarihi")
    private LocalDateTime yanitlanmaTarihi;

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
