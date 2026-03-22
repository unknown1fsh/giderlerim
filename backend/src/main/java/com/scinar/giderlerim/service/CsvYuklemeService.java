package com.scinar.giderlerim.service;

import com.scinar.giderlerim.dto.response.ApiResponse;
import com.scinar.giderlerim.dto.response.CsvYuklemeResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface CsvYuklemeService {
    ApiResponse<CsvYuklemeResponse> dosyaYukle(Long kullaniciId, MultipartFile dosya);
    ApiResponse<CsvYuklemeResponse> durumSorgula(Long kullaniciId, Long yuklemeId);
    ApiResponse<List<CsvYuklemeResponse>> gecmis(Long kullaniciId);
}
