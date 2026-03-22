package com.scinar.giderlerim.repository;

import com.scinar.giderlerim.entity.Uyari;
import com.scinar.giderlerim.entity.enums.UyariTuru;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UyariRepository extends JpaRepository<Uyari, Long> {

    @Query("SELECT u FROM Uyari u WHERE u.kullanici.id = :kullaniciId AND u.deletedAt IS NULL ORDER BY u.createdAt DESC")
    Page<Uyari> findByKullaniciIdAndDeletedAtIsNull(@Param("kullaniciId") Long kullaniciId, Pageable pageable);

    Optional<Uyari> findByIdAndKullaniciIdAndDeletedAtIsNull(Long id, Long kullaniciId);

    @Query("SELECT COUNT(u) FROM Uyari u WHERE u.kullanici.id = :kullaniciId AND u.okunduMu = false AND u.deletedAt IS NULL")
    long countOkunmamisByKullaniciId(@Param("kullaniciId") Long kullaniciId);

    @Modifying
    @Query("UPDATE Uyari u SET u.okunduMu = true, u.updatedAt = CURRENT_TIMESTAMP WHERE u.kullanici.id = :kullaniciId AND u.okunduMu = false AND u.deletedAt IS NULL")
    int tumunuOkunduIsaretle(@Param("kullaniciId") Long kullaniciId);

    @Query("""
        SELECT COUNT(u) FROM Uyari u
        WHERE u.kullanici.id = :kullaniciId
          AND u.tur = :tur
          AND u.ilgiliId = :ilgiliId
          AND EXTRACT(MONTH FROM u.createdAt) = :ay
          AND EXTRACT(YEAR FROM u.createdAt) = :yil
          AND u.deletedAt IS NULL
        """)
    long countBenzerUyari(
            @Param("kullaniciId") Long kullaniciId,
            @Param("tur") UyariTuru tur,
            @Param("ilgiliId") Long ilgiliId,
            @Param("ay") int ay,
            @Param("yil") int yil);
}
