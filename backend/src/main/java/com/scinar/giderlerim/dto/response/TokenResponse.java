package com.scinar.giderlerim.dto.response;

public record TokenResponse(
        String accessToken,
        String refreshToken,
        String tokenTipi,
        long gecerlilikSaniye
) {
    public TokenResponse(String accessToken, String refreshToken) {
        this(accessToken, refreshToken, "Bearer", 3600L);
    }
}
