package com.scinar.giderlerim.service;

import com.scinar.giderlerim.dto.request.GiderGuncelleRequest;
import com.scinar.giderlerim.dto.request.GiderOlusturRequest;
import com.scinar.giderlerim.dto.response.ApiResponse;
import com.scinar.giderlerim.dto.response.GiderResponse;
import com.scinar.giderlerim.dto.response.SayfaliResponse;
import com.scinar.giderlerim.entity.enums.OdemeYontemi;

import java.time.LocalDate;

public interface GiderService {
    ApiResponse<SayfaliResponse<GiderResponse>> listele(Long kullaniciId, Long kategoriId, LocalDate baslangic, LocalDate bitis, OdemeYontemi odemeYontemi, int page, int size);
    ApiResponse<GiderResponse> getById(Long kullaniciId, Long giderId);
    ApiResponse<GiderResponse> olustur(Long kullaniciId, GiderOlusturRequest request);
    ApiResponse<GiderResponse> guncelle(Long kullaniciId, Long giderId, GiderGuncelleRequest request);
    ApiResponse<Void> sil(Long kullaniciId, Long giderId);
}
