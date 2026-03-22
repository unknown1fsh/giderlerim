package com.scinar.giderlerim.service;

import com.scinar.giderlerim.dto.admin.*;
import com.scinar.giderlerim.dto.response.ApiResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface AdminService {

    ApiResponse<AdminIstatistikDto> getIstatistikler();

    ApiResponse<Page<AdminKullaniciListeDto>> kullanicilariListele(String arama, String plan, Boolean aktif, Pageable pageable);

    ApiResponse<AdminKullaniciListeDto> kullaniciGetir(Long id);

    ApiResponse<AdminKullaniciListeDto> kullaniciGuncelle(Long id, AdminKullaniciGuncelleRequest request);

    ApiResponse<Void> kullaniciSil(Long id);

    ApiResponse<List<SistemParametresiDto>> parametreleriListele();

    ApiResponse<SistemParametresiDto> parametreGuncelle(Long id, SistemParametresiGuncelleRequest request);

    ApiResponse<SistemParametresiDto> parametreOlustur(SistemParametresiOlusturRequest request);

    ApiResponse<Void> parametreSil(Long id);

    ApiResponse<SistemParametresiDto> parametreVarsayilanaGetir(Long id);
}
