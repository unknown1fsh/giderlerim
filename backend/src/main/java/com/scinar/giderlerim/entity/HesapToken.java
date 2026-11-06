package com.scinar.giderlerim.entity;

import com.scinar.giderlerim.entity.enums.HesapTokenTuru;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "hesap_tokenlari")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HesapToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "kullanici_id", nullable = false)
    private Kullanici kullanici;

    @Enumerated(EnumType.STRING)
    @Column(name = "tur", nullable = false, length = 30)
    private HesapTokenTuru tur;

    @Column(name = "token_hash", nullable = false, unique = true, length = 64)
    private String tokenHash;

    @Column(name = "son_kullanma_tarihi", nullable = false)
    private LocalDateTime sonKullanmaTarihi;

    @Column(name = "kullanildi_at")
    private LocalDateTime kullanildiAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void olusturuldu() {
        createdAt = LocalDateTime.now();
    }

    public boolean kullanilabilir(LocalDateTime simdi) {
        return kullanildiAt == null && sonKullanmaTarihi.isAfter(simdi);
    }
}
