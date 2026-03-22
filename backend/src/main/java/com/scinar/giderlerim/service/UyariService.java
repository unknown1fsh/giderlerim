package com.scinar.giderlerim.service;

import com.scinar.giderlerim.dto.response.ApiResponse;
import com.scinar.giderlerim.dto.response.SayfaliResponse;
import com.scinar.giderlerim.dto.response.UyariResponse;

public interface UyariService {
    ApiResponse<SayfaliResponse<UyariResponse>> listele(Long kullaniciId, int page, int size);
    ApiResponse<UyariResponse> okunduIsaretle(Long kullaniciId, Long uyariId);
    ApiResponse<Void> tumunuOkunduIsaretle(Long kullaniciId);
    ApiResponse<Void> sil(Long kullaniciId, Long uyariId);
    ApiResponse<Long> sayac(Long kullaniciId);
    void butceKontrolEt(Long kullaniciId, Long kategoriId, int ay, int yil);
}
