package com.scinar.giderlerim.repository;

import com.scinar.giderlerim.entity.Kullanici;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface KullaniciRepository extends JpaRepository<Kullanici, Long> {
    Optional<Kullanici> findByEmailAndDeletedAtIsNull(String email);
    boolean existsByEmail(String email);
}
