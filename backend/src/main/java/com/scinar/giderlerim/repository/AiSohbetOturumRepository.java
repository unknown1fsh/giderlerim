package com.scinar.giderlerim.repository;

import com.scinar.giderlerim.entity.AiSohbetOturumu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AiSohbetOturumRepository extends JpaRepository<AiSohbetOturumu, Long> {

    @Query("SELECT o FROM AiSohbetOturumu o WHERE o.kullanici.id = :kullaniciId AND o.deletedAt IS NULL ORDER BY o.updatedAt DESC")
    List<AiSohbetOturumu> findByKullaniciIdAndDeletedAtIsNull(@Param("kullaniciId") Long kullaniciId);

    Optional<AiSohbetOturumu> findByIdAndKullaniciIdAndDeletedAtIsNull(Long id, Long kullaniciId);
}
