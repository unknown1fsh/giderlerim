package com.scinar.giderlerim.service;

import com.scinar.giderlerim.dto.request.GirisRequest;
import com.scinar.giderlerim.dto.request.KayitRequest;
import com.scinar.giderlerim.dto.response.ApiResponse;
import com.scinar.giderlerim.dto.response.TokenResponse;

public interface AuthService {
    ApiResponse<TokenResponse> kayitOl(KayitRequest request);
    ApiResponse<TokenResponse> girisYap(GirisRequest request);
    ApiResponse<TokenResponse> tokenYenile(String refreshToken);
}
