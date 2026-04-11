package com.scinar.giderlerim.repository;

import com.scinar.giderlerim.entity.Gider;
import com.scinar.giderlerim.entity.enums.OdemeYontemi;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface GiderRepository extends JpaRepository<Gider, Long> {

    @Query("SELECT g FROM Gider g WHERE g.kullanici.id = :kullaniciId AND g.deletedAt IS NULL ORDER BY g.tarih DESC, g.createdAt DESC")
    Page<Gider> findByKullaniciIdAndDeletedAtIsNull(@Param("kullaniciId") Long kullaniciId, Pageable pageable);

    Optional<Gider> findByIdAndKullaniciIdAndDeletedAtIsNull(Long id, Long kullaniciId);

    @Query("""
        SELECT g.kategori.id, g.kategori.ad, g.kategori.ikon, g.kategori.renk, SUM(g.tutar)
        FROM Gider g
        WHERE g.kullanici.id = :kullaniciId
          AND EXTRACT(MONTH FROM g.tarih) = :ay
          AND EXTRACT(YEAR FROM g.tarih) = :yil
          AND g.deletedAt IS NULL
        GROUP BY g.kategori.id, g.kategori.ad, g.kategori.ikon, g.kategori.renk
        ORDER BY SUM(g.tutar) DESC
        """)
    List<Object[]> findKategoriToplamlar(
            @Param("kullaniciId") Long kullaniciId,
            @Param("ay") int ay,
            @Param("yil") int yil);

    @Query("""
        SELECT g.tarih, SUM(g.tutar)
        FROM Gider g
        WHERE g.kullanici.id = :kullaniciId
          AND g.tarih BETWEEN :baslangic AND :bitis
          AND g.deletedAt IS NULL
        GROUP BY g.tarih
        ORDER BY g.tarih ASC
        """)
    List<Object[]> findGunlukToplamlar(
            @Param("kullaniciId") Long kullaniciId,
            @Param("baslangic") LocalDate baslangic,
            @Param("bitis") LocalDate bitis);

    @Query("""
        SELECT COALESCE(SUM(g.tutar), 0)
        FROM Gider g
        WHERE g.kullanici.id = :kullaniciId
          AND EXTRACT(MONTH FROM g.tarih) = :ay
          AND EXTRACT(YEAR FROM g.tarih) = :yil
          AND g.deletedAt IS NULL
        """)
    BigDecimal findAylikToplam(
            @Param("kullaniciId") Long kullaniciId,
            @Param("ay") int ay,
            @Param("yil") int yil);

    @Query("""
        SELECT COALESCE(SUM(g.tutar), 0)
        FROM Gider g
        WHERE g.kullanici.id = :kullaniciId
          AND EXTRACT(MONTH FROM g.tarih) = :ay
          AND EXTRACT(YEAR FROM g.tarih) = :yil
          AND g.odemeYontemi = :odemeYontemi
          AND g.deletedAt IS NULL
        """)
    BigDecimal findAylikToplamByOdemeYontemi(
            @Param("kullaniciId") Long kullaniciId,
            @Param("ay") int ay,
            @Param("yil") int yil,
            @Param("odemeYontemi") OdemeYontemi odemeYontemi);

    @Query("SELECT g FROM Gider g WHERE g.kullanici.id = :kullaniciId AND g.anormalMi = true AND g.deletedAt IS NULL ORDER BY g.tarih DESC")
    List<Gider> findAnormalGiderler(@Param("kullaniciId") Long kullaniciId);

    @Query("SELECT g FROM Gider g WHERE g.kullanici.id = :kullaniciId AND g.tarih >= :baslangic AND g.deletedAt IS NULL ORDER BY g.tarih DESC")
    List<Gider> findSon3AyGiderler(@Param("kullaniciId") Long kullaniciId, @Param("baslangic") LocalDate baslangic);

    @Query("SELECT g FROM Gider g WHERE g.kullanici.id = :kullaniciId AND g.tarih >= :baslangic AND g.tarih <= :bitis AND g.deletedAt IS NULL ORDER BY g.tarih DESC")
    List<Gider> findTarihAraligiGiderler(@Param("kullaniciId") Long kullaniciId, @Param("baslangic") LocalDate baslangic, @Param("bitis") LocalDate bitis);

    @Query("""
        SELECT g FROM Gider g
        WHERE g.kullanici.id = :kullaniciId
          AND g.deletedAt IS NULL
          AND (:kategoriId IS NULL OR g.kategori.id = :kategoriId)
          AND (:baslangicTarihi IS NULL OR g.tarih >= :baslangicTarihi)
          AND (:bitisTarihi IS NULL OR g.tarih <= :bitisTarihi)
          AND (:odemeYontemi IS NULL OR g.odemeYontemi = :odemeYontemi)
        ORDER BY g.tarih DESC, g.createdAt DESC
        """)
    Page<Gider> findFiltreli(
            @Param("kullaniciId") Long kullaniciId,
            @Param("kategoriId") Long kategoriId,
            @Param("baslangicTarihi") LocalDate baslangicTarihi,
            @Param("bitisTarihi") LocalDate bitisTarihi,
            @Param("odemeYontemi") OdemeYontemi odemeYontemi,
            Pageable pageable);

    @Query("""
        SELECT COALESCE(SUM(g.tutar), 0)
        FROM Gider g
        WHERE g.kullanici.id = :kullaniciId
          AND g.kategori.id = :kategoriId
          AND EXTRACT(MONTH FROM g.tarih) = :ay
          AND EXTRACT(YEAR FROM g.tarih) = :yil
          AND g.deletedAt IS NULL
        """)
    BigDecimal findKategoriAylikToplam(
            @Param("kullaniciId") Long kullaniciId,
            @Param("kategoriId") Long kategoriId,
            @Param("ay") int ay,
            @Param("yil") int yil);

    @Query("SELECT COUNT(g) FROM Gider g WHERE g.kullanici.id = :kullaniciId AND EXTRACT(MONTH FROM g.tarih) = :ay AND EXTRACT(YEAR FROM g.tarih) = :yil AND g.deletedAt IS NULL")
    long countByKullaniciIdAndAyAndYil(
            @Param("kullaniciId") Long kullaniciId,
            @Param("ay") int ay,
            @Param("yil") int yil);

    @Query("SELECT COUNT(g) FROM Gider g WHERE g.kullanici.id = :kullaniciId AND g.anormalMi = true AND g.deletedAt IS NULL")
    long countAnormalByKullaniciId(@Param("kullaniciId") Long kullaniciId);

    @Query("SELECT COUNT(g) FROM Gider g WHERE g.deletedAt IS NULL")
    long countToplamGider();

    @Query("SELECT COALESCE(SUM(g.tutar), 0) FROM Gider g WHERE g.deletedAt IS NULL")
    BigDecimal sumToplamGiderTutari();
}
