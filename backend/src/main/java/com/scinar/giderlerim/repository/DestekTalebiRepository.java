package com.scinar.giderlerim.repository;

import com.scinar.giderlerim.entity.DestekTalebi;
import com.scinar.giderlerim.entity.enums.DestekDurumu;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface DestekTalebiRepository extends JpaRepository<DestekTalebi, Long> {

    @Query("SELECT d FROM DestekTalebi d WHERE d.kullanici.id = :kullaniciId AND d.deletedAt IS NULL ORDER BY d.createdAt DESC")
    Page<DestekTalebi> findByKullaniciIdAndDeletedAtIsNull(@Param("kullaniciId") Long kullaniciId, Pageable pageable);

    Optional<DestekTalebi> findByIdAndKullaniciIdAndDeletedAtIsNull(Long id, Long kullaniciId);

    Optional<DestekTalebi> findByIdAndDeletedAtIsNull(Long id);

    @Query("""
        SELECT d FROM DestekTalebi d
        WHERE d.deletedAt IS NULL
          AND (:durum IS NULL OR d.durum = :durum)
          AND (:oncelik IS NULL OR d.oncelik = :oncelik)
          AND (:kategori IS NULL OR d.kategori = :kategori)
        ORDER BY d.createdAt DESC
        """)
    Page<DestekTalebi> findAllFiltreli(
            @Param("durum") DestekDurumu durum,
            @Param("oncelik") com.scinar.giderlerim.entity.enums.DestekOnceligi oncelik,
            @Param("kategori") com.scinar.giderlerim.entity.enums.DestekKategorisi kategori,
            Pageable pageable);

    long countByDurumAndDeletedAtIsNull(DestekDurumu durum);

    long countByDeletedAtIsNull();
}
