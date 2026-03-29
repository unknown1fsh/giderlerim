package com.scinar.giderlerim.service;

import com.scinar.giderlerim.dto.request.DestekTalebiOlusturRequest;
import com.scinar.giderlerim.dto.request.DestekTalebiYanitlaRequest;
import com.scinar.giderlerim.dto.response.ApiResponse;
import com.scinar.giderlerim.dto.response.DestekTalebiResponse;
import com.scinar.giderlerim.dto.response.SayfaliResponse;
import com.scinar.giderlerim.entity.enums.DestekDurumu;

public interface DestekTalebiService {

    // Kullanıcı işlemleri
    ApiResponse<DestekTalebiResponse> olustur(Long kullaniciId, DestekTalebiOlusturRequest request);
    ApiResponse<SayfaliResponse<DestekTalebiResponse>> kullaniciTalepleri(Long kullaniciId, int sayfa, int boyut);
    ApiResponse<DestekTalebiResponse> kullaniciTalebiGetir(Long kullaniciId, Long talepId);
    ApiResponse<Void> sil(Long kullaniciId, Long talepId);

    // Admin işlemleri
    ApiResponse<SayfaliResponse<DestekTalebiResponse>> adminTumTalepleri(String durum, String oncelik, String kategori, int sayfa, int boyut);
    ApiResponse<DestekTalebiResponse> adminTalebiGetir(Long talepId);
    ApiResponse<DestekTalebiResponse> adminYanitla(Long talepId, Long adminId, DestekTalebiYanitlaRequest request);
    ApiResponse<DestekTalebiResponse> adminDurumGuncelle(Long talepId, DestekDurumu durum);

    // İstatistikler
    long toplamTalepSayisi();
    long acikTalepSayisi();
}
