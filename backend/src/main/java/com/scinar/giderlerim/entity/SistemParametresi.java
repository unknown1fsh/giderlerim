package com.scinar.giderlerim.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "sistem_parametreleri")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SistemParametresi {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String anahtar;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String deger;

    @Column(name = "varsayilan_deger", nullable = false, columnDefinition = "TEXT")
    private String varsayilanDeger;

    @Column(length = 500)
    private String aciklama;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String tip = "STRING"; // STRING, NUMBER, BOOLEAN

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String kategori = "GENEL"; // GUVENLIK, AI, SISTEM, PLAN, GENEL

    @Column(nullable = false)
    @Builder.Default
    private Boolean duzenlenebilir = true;

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
