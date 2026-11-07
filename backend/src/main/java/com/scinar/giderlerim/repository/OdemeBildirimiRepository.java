package com.scinar.giderlerim.repository;

import com.scinar.giderlerim.entity.OdemeBildirimi;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OdemeBildirimiRepository extends JpaRepository<OdemeBildirimi, Long> {
    boolean existsByWebhookId(String webhookId);
}
