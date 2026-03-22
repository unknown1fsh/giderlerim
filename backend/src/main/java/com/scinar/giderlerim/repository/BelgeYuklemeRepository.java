package com.scinar.giderlerim.repository;

import com.scinar.giderlerim.entity.BelgeYukleme;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BelgeYuklemeRepository extends JpaRepository<BelgeYukleme, Long> {

    @Query("SELECT b FROM BelgeYukleme b WHERE b.kullanici.id = :kullaniciId ORDER BY b.createdAt DESC")
    List<BelgeYukleme> findByKullaniciIdOrderByCreatedAtDesc(@Param("kullaniciId") Long kullaniciId);

    Optional<BelgeYukleme> findByIdAndKullaniciId(Long id, Long kullaniciId);
}
