package com.scinar.giderlerim.service;

import com.scinar.giderlerim.dto.request.ProfilGuncelleRequest;
import com.scinar.giderlerim.dto.response.ApiResponse;
import com.scinar.giderlerim.dto.response.KullaniciResponse;

public interface KullaniciService {
    ApiResponse<KullaniciResponse> getProfil(Long kullaniciId);
    ApiResponse<KullaniciResponse> gunceleProfil(Long kullaniciId, ProfilGuncelleRequest request);
    ApiResponse<Void> hesabiSil(Long kullaniciId);
}
