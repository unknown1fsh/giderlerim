package com.scinar.giderlerim.entity;

import com.scinar.giderlerim.entity.enums.AnalizTuru;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "ai_analiz_sonuclari")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiAnalizSonucu {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "kullanici_id", nullable = false)
    private Kullanici kullanici;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "analiz_turu", nullable = false)
    private AnalizTuru tur;

    @Column
    private Integer ay;

    @Column
    private Integer yil;

    @Column(name = "icerik_json", columnDefinition = "TEXT", nullable = false)
    private String icerikJson;

    @Column(name = "gecerlilik_suresi", nullable = false)
    private LocalDateTime gecerlilikSuresi;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
