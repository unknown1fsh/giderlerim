package com.scinar.giderlerim.repository;

import com.scinar.giderlerim.entity.CsvYukleme;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CsvYuklemeRepository extends JpaRepository<CsvYukleme, Long> {

    @Query("SELECT c FROM CsvYukleme c WHERE c.kullanici.id = :kullaniciId ORDER BY c.createdAt DESC")
    List<CsvYukleme> findByKullaniciIdOrderByCreatedAtDesc(@Param("kullaniciId") Long kullaniciId);

    Optional<CsvYukleme> findByIdAndKullaniciId(Long id, Long kullaniciId);
}
