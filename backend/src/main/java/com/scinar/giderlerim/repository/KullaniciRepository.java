package com.scinar.giderlerim.repository;

import com.scinar.giderlerim.entity.Kullanici;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface KullaniciRepository extends JpaRepository<Kullanici, Long>, JpaSpecificationExecutor<Kullanici> {
    Optional<Kullanici> findByEmailAndDeletedAtIsNull(String email);
    boolean existsByEmail(String email);

    @Query("SELECT COUNT(g) FROM Gider g WHERE g.kullanici.id = :kullaniciId AND g.deletedAt IS NULL")
    long countGiderByKullaniciId(@Param("kullaniciId") Long kullaniciId);
}
