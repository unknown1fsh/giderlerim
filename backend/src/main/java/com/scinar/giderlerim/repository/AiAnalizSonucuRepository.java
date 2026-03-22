package com.scinar.giderlerim.repository;

import com.scinar.giderlerim.entity.AiAnalizSonucu;
import com.scinar.giderlerim.entity.enums.AnalizTuru;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AiAnalizSonucuRepository extends JpaRepository<AiAnalizSonucu, Long> {

    @Query("""
        SELECT a FROM AiAnalizSonucu a
        WHERE a.kullanici.id = :kullaniciId
          AND a.tur = :tur
          AND a.ay = :ay
          AND a.yil = :yil
          AND a.gecerlilikSuresi > :simdi
        ORDER BY a.createdAt DESC
        """)
    Optional<AiAnalizSonucu> findGecerliAnaliz(
            @Param("kullaniciId") Long kullaniciId,
            @Param("tur") AnalizTuru tur,
            @Param("ay") Integer ay,
            @Param("yil") Integer yil,
            @Param("simdi") LocalDateTime simdi);

    @Query("""
        SELECT a FROM AiAnalizSonucu a
        WHERE a.kullanici.id = :kullaniciId
          AND a.tur = :tur
          AND a.ay IS NULL
          AND a.yil IS NULL
          AND a.gecerlilikSuresi > :simdi
        ORDER BY a.createdAt DESC
        """)
    Optional<AiAnalizSonucu> findGecerliAnalizAysiz(
            @Param("kullaniciId") Long kullaniciId,
            @Param("tur") AnalizTuru tur,
            @Param("simdi") LocalDateTime simdi);

    @Query("SELECT a FROM AiAnalizSonucu a WHERE a.kullanici.id = :kullaniciId ORDER BY a.createdAt DESC")
    List<AiAnalizSonucu> findByKullaniciId(@Param("kullaniciId") Long kullaniciId);
}
