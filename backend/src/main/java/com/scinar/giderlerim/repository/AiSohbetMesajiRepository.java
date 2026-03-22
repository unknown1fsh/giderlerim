package com.scinar.giderlerim.repository;

import com.scinar.giderlerim.entity.AiSohbetMesaji;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AiSohbetMesajiRepository extends JpaRepository<AiSohbetMesaji, Long> {

    @Query("SELECT m FROM AiSohbetMesaji m WHERE m.oturum.id = :oturumId ORDER BY m.createdAt ASC")
    List<AiSohbetMesaji> findByOturumIdOrderByCreatedAtAsc(@Param("oturumId") Long oturumId);

    @Query("SELECT m FROM AiSohbetMesaji m WHERE m.oturum.id = :oturumId ORDER BY m.createdAt DESC")
    List<AiSohbetMesaji> findSonMesajlar(@Param("oturumId") Long oturumId, Pageable pageable);
}
