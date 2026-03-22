package com.scinar.giderlerim.entity;

import com.scinar.giderlerim.entity.enums.YuklemeDurumu;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "csv_yuklemeler")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CsvYukleme {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "kullanici_id", nullable = false)
    private Kullanici kullanici;

    @Column(name = "dosya_adi", nullable = false, length = 255)
    private String dosyaAdi;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "yukleme_durumu", nullable = false)
    @Builder.Default
    private YuklemeDurumu durum = YuklemeDurumu.ISLENIYOR;

    @Column(name = "toplam_satir")
    @Builder.Default
    private Integer toplamSatir = 0;

    @Column(name = "islenen_satir")
    @Builder.Default
    private Integer islenenSatir = 0;

    @Column(name = "hata_mesaji", columnDefinition = "TEXT")
    private String hataMesaji;

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
