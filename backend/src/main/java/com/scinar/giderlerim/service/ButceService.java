package com.scinar.giderlerim.service;

import com.scinar.giderlerim.dto.request.ButceGuncelleRequest;
import com.scinar.giderlerim.dto.request.ButceOlusturRequest;
import com.scinar.giderlerim.dto.response.ApiResponse;
import com.scinar.giderlerim.dto.response.ButceOzetResponse;
import com.scinar.giderlerim.dto.response.ButceResponse;

import java.util.List;

public interface ButceService {
    ApiResponse<List<ButceResponse>> listele(Long kullaniciId, int ay, int yil);
    ApiResponse<ButceResponse> olustur(Long kullaniciId, ButceOlusturRequest request);
    ApiResponse<ButceResponse> guncelle(Long kullaniciId, Long butceId, ButceGuncelleRequest request);
    ApiResponse<Void> sil(Long kullaniciId, Long butceId);
    ApiResponse<List<ButceOzetResponse>> getAylikOzetler(Long kullaniciId, int ay, int yil);
}
