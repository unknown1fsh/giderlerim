package com.scinar.giderlerim.entity;

import com.scinar.giderlerim.entity.enums.MesajRolu;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "ai_sohbet_mesajlari")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiSohbetMesaji {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "oturum_id", nullable = false)
    private AiSohbetOturumu oturum;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "mesaj_rolu", nullable = false)
    private MesajRolu rol;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String icerik;

    @Column(name = "token_sayisi")
    private Integer tokenSayisi;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
