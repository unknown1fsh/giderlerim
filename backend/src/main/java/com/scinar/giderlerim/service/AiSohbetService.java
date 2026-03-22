package com.scinar.giderlerim.service;

import com.scinar.giderlerim.dto.request.SohbetMesajiRequest;
import com.scinar.giderlerim.dto.response.ApiResponse;
import com.scinar.giderlerim.dto.response.SohbetMesajiResponse;
import com.scinar.giderlerim.dto.response.SohbetOturumResponse;

import java.util.List;

public interface AiSohbetService {
    ApiResponse<List<SohbetOturumResponse>> getOturumlar(Long kullaniciId);
    ApiResponse<SohbetOturumResponse> yeniOturumBaslat(Long kullaniciId);
    ApiResponse<List<SohbetMesajiResponse>> getMesajlar(Long kullaniciId, Long oturumId);
    ApiResponse<SohbetMesajiResponse> mesajGonder(Long kullaniciId, Long oturumId, SohbetMesajiRequest request);
    ApiResponse<Void> oturumKapat(Long kullaniciId, Long oturumId);
}
