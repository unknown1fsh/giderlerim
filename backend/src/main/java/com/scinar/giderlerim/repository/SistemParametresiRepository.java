package com.scinar.giderlerim.repository;

import com.scinar.giderlerim.entity.SistemParametresi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SistemParametresiRepository extends JpaRepository<SistemParametresi, Long> {

    List<SistemParametresi> findByKategoriOrderByAnahtarAsc(String kategori);

    Optional<SistemParametresi> findByAnahtar(String anahtar);

    List<SistemParametresi> findAllByOrderByKategoriAscAnahtarAsc();

    boolean existsByAnahtar(String anahtar);
}
