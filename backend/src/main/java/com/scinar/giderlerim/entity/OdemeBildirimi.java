package com.scinar.giderlerim.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/** İşlenmiş Shopier webhook kaydı; aynı {@code Shopier-Webhook-Id} ikinci kez işlenmez. */
@Entity
@Table(name = "odeme_bildirimleri")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OdemeBildirimi {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "webhook_id", nullable = false, unique = true, length = 100)
    private String webhookId;

    @Column(nullable = false, length = 50)
    private String olay;

    @Column(name = "govde_izi", nullable = false, length = 64)
    private String govdeIzi;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void olusturuldu() {
        createdAt = LocalDateTime.now();
    }
}
