package com.scinar.giderlerim.service;

import com.scinar.giderlerim.dto.response.ApiResponse;
import com.scinar.giderlerim.dto.response.BelgeYuklemeResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface BelgeYuklemeService {
    ApiResponse<BelgeYuklemeResponse> dosyaYukle(Long kullaniciId, MultipartFile dosya);
    ApiResponse<BelgeYuklemeResponse> durumSorgula(Long kullaniciId, Long yuklemeId);
    ApiResponse<List<BelgeYuklemeResponse>> gecmis(Long kullaniciId);
}
