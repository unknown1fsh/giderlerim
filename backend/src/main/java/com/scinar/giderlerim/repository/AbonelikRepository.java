package com.scinar.giderlerim.repository;

import com.scinar.giderlerim.entity.Abonelik;
import com.scinar.giderlerim.entity.enums.AbonelikDurumu;
import com.scinar.giderlerim.entity.enums.AbonelikKaynagi;
import com.scinar.giderlerim.entity.enums.PlanTuru;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface AbonelikRepository extends JpaRepository<Abonelik, Long> {

    List<Abonelik> findByKullaniciIdAndDurum(Long kullaniciId, AbonelikDurumu durum);

    List<Abonelik> findByKullaniciIdAndDurumAndKaynak(Long kullaniciId, AbonelikDurumu durum, AbonelikKaynagi kaynak);

    List<Abonelik> findBySiparisId(Long siparisId);

    List<Abonelik> findByKullaniciIdOrderByCreatedAtDesc(Long kullaniciId);

    @Query("SELECT a FROM Abonelik a JOIN FETCH a.kullanici WHERE a.durum = com.scinar.giderlerim.entity.enums.AbonelikDurumu.AKTIF AND a.bitis IS NOT NULL AND a.bitis <= :simdi")
    List<Abonelik> findSuresiDolanlar(@Param("simdi") LocalDateTime simdi);

    @Query("""
        SELECT a FROM Abonelik a
        WHERE a.kullanici.id = :kullaniciId AND a.plan = :plan AND a.durum = com.scinar.giderlerim.entity.enums.AbonelikDurumu.AKTIF
          AND a.bitis IS NOT NULL AND a.bitis > :simdi
        ORDER BY a.bitis DESC
        """)
    List<Abonelik> findUzatilabilir(@Param("kullaniciId") Long kullaniciId,
                                    @Param("plan") PlanTuru plan,
                                    @Param("simdi") LocalDateTime simdi);
}
