package com.scinar.giderlerim.service;

import com.scinar.giderlerim.dto.request.KategoriGuncelleRequest;
import com.scinar.giderlerim.dto.request.KategoriOlusturRequest;
import com.scinar.giderlerim.dto.response.ApiResponse;
import com.scinar.giderlerim.dto.response.KategoriResponse;

import java.util.List;

public interface KategoriService {
    ApiResponse<List<KategoriResponse>> listele(Long kullaniciId);
    ApiResponse<KategoriResponse> olustur(Long kullaniciId, KategoriOlusturRequest request);
    ApiResponse<KategoriResponse> guncelle(Long kullaniciId, Long kategoriId, KategoriGuncelleRequest request);
    ApiResponse<Void> sil(Long kullaniciId, Long kategoriId);
}
