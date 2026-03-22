package com.scinar.giderlerim.repository;

import com.scinar.giderlerim.entity.Butce;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ButceRepository extends JpaRepository<Butce, Long> {

    @Query("SELECT b FROM Butce b WHERE b.kullanici.id = :kullaniciId AND b.ay = :ay AND b.yil = :yil AND b.deletedAt IS NULL AND b.aktif = true ORDER BY b.kategori.ad ASC")
    List<Butce> findByKullaniciIdAndAyAndYilAndDeletedAtIsNull(
            @Param("kullaniciId") Long kullaniciId,
            @Param("ay") int ay,
            @Param("yil") int yil);

    @Query("SELECT b FROM Butce b WHERE b.kullanici.id = :kullaniciId AND b.kategori.id = :kategoriId AND b.ay = :ay AND b.yil = :yil AND b.deletedAt IS NULL")
    Optional<Butce> findByKullaniciIdAndKategoriIdAndAyAndYilAndDeletedAtIsNull(
            @Param("kullaniciId") Long kullaniciId,
            @Param("kategoriId") Long kategoriId,
            @Param("ay") int ay,
            @Param("yil") int yil);

    Optional<Butce> findByIdAndKullaniciIdAndDeletedAtIsNull(Long id, Long kullaniciId);

    @Query("SELECT b FROM Butce b WHERE b.kullanici.id = :kullaniciId AND b.deletedAt IS NULL ORDER BY b.yil DESC, b.ay DESC")
    List<Butce> findAllByKullaniciId(@Param("kullaniciId") Long kullaniciId);
}
