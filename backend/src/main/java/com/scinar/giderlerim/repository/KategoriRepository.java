package com.scinar.giderlerim.repository;

import com.scinar.giderlerim.entity.Kategori;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface KategoriRepository extends JpaRepository<Kategori, Long> {

    @Query("SELECT k FROM Kategori k WHERE (k.sistemMi = true OR k.kullanici.id = :kullaniciId) AND k.deletedAt IS NULL AND k.aktif = true ORDER BY k.sistemMi DESC, k.ad ASC")
    List<Kategori> findAllByKullaniciId(@Param("kullaniciId") Long kullaniciId);

    Optional<Kategori> findByIdAndDeletedAtIsNull(Long id);

    @Query("SELECT k FROM Kategori k WHERE k.id = :id AND (k.sistemMi = true OR k.kullanici.id = :kullaniciId) AND k.deletedAt IS NULL")
    Optional<Kategori> findByIdAndKullaniciIdOrSistemMi(@Param("id") Long id, @Param("kullaniciId") Long kullaniciId);
}
