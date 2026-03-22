package com.scinar.giderlerim.service;

import com.scinar.giderlerim.dto.response.AiAnalizResponse;
import com.scinar.giderlerim.dto.response.ApiResponse;

public interface AiAnalizService {
    ApiResponse<AiAnalizResponse> harcamaAnaliziYap(Long kullaniciId, int ay, int yil);
    ApiResponse<AiAnalizResponse> butceOnerisiAl(Long kullaniciId);
    ApiResponse<AiAnalizResponse> anomaliTespitEt(Long kullaniciId);
    ApiResponse<AiAnalizResponse> tasarrufFirsatlariniGoster(Long kullaniciId);
}
