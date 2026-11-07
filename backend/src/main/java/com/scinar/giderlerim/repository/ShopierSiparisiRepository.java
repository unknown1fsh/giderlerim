package com.scinar.giderlerim.repository;

import com.scinar.giderlerim.entity.ShopierSiparisi;
import com.scinar.giderlerim.entity.enums.SiparisDurumu;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ShopierSiparisiRepository extends JpaRepository<ShopierSiparisi, Long> {
    Optional<ShopierSiparisi> findByShopierSiparisId(String shopierSiparisId);

    @EntityGraph(attributePaths = "kullanici")
    Page<ShopierSiparisi> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @EntityGraph(attributePaths = "kullanici")
    Page<ShopierSiparisi> findByDurumOrderByCreatedAtDesc(SiparisDurumu durum, Pageable pageable);
}
