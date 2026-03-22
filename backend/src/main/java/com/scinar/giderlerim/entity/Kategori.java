package com.scinar.giderlerim.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "kategoriler")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Kategori {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "kullanici_id")
    private Kullanici kullanici;

    @Column(nullable = false, length = 100)
    private String ad;

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String ikon = "tag";

    @Column(nullable = false, length = 7)
    @Builder.Default
    private String renk = "#6B7280";

    @Column(name = "sistem_mi", nullable = false)
    @Builder.Default
    private Boolean sistemMi = false;

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
