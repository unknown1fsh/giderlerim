package com.scinar.giderlerim.entity;

import com.scinar.giderlerim.entity.enums.AbonelikDurumu;
import com.scinar.giderlerim.entity.enums.AbonelikKaynagi;
import com.scinar.giderlerim.entity.enums.PlanTuru;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Kullanıcının ücretli plan hakkı. {@code bitis == null} süresiz (admin ataması) demektir.
 * Kullanıcının etkin planı, aktif aboneliklerin en yüksek planıdır.
 */
@Entity
@Table(name = "abonelikler")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Abonelik {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "kullanici_id", nullable = false)
    private Kullanici kullanici;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PlanTuru plan;

    @Column(nullable = false)
    private LocalDateTime baslangic;

    private LocalDateTime bitis;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AbonelikKaynagi kaynak;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "siparis_id")
    private ShopierSiparisi siparis;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AbonelikDurumu durum;

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

    public boolean gecerli(LocalDateTime simdi) {
        return durum == AbonelikDurumu.AKTIF && (bitis == null || bitis.isAfter(simdi));
    }
}
