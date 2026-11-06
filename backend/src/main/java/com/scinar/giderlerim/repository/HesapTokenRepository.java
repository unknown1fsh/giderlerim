package com.scinar.giderlerim.repository;

import com.scinar.giderlerim.entity.HesapToken;
import com.scinar.giderlerim.entity.enums.HesapTokenTuru;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface HesapTokenRepository extends JpaRepository<HesapToken, Long> {
    Optional<HesapToken> findByTokenHashAndTur(String tokenHash, HesapTokenTuru tur);
}
