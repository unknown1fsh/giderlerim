package com.scinar.giderlerim.entity;

import com.scinar.giderlerim.entity.enums.UyariTuru;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "uyarilar")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Uyari {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "kullanici_id", nullable = false)
    private Kullanici kullanici;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "uyari_turu", nullable = false)
    private UyariTuru tur;

    @Column(nullable = false, length = 200)
    private String baslik;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String mesaj;

    @Column(name = "okundu_mu", nullable = false)
    @Builder.Default
    private Boolean okunduMu = false;

    @Column(name = "ilgili_id")
    private Long ilgiliId;

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
