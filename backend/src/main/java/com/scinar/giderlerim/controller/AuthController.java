package com.scinar.giderlerim.controller;

import com.scinar.giderlerim.dto.request.GirisRequest;
import com.scinar.giderlerim.dto.request.KayitRequest;
import com.scinar.giderlerim.dto.response.ApiResponse;
import com.scinar.giderlerim.dto.response.TokenResponse;
import com.scinar.giderlerim.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/kayit")
    public ResponseEntity<ApiResponse<TokenResponse>> kayitOl(
            @Valid @RequestBody KayitRequest request) {
        ApiResponse<TokenResponse> yanit = authService.kayitOl(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(yanit);
    }

    @PostMapping("/giris")
    public ResponseEntity<ApiResponse<TokenResponse>> girisYap(
            @Valid @RequestBody GirisRequest request) {
        ApiResponse<TokenResponse> yanit = authService.girisYap(request);
        return ResponseEntity.ok(yanit);
    }

    @PostMapping("/token-yenile")
    public ResponseEntity<ApiResponse<TokenResponse>> tokenYenile(
            @RequestHeader("X-Refresh-Token") String refreshToken) {
        ApiResponse<TokenResponse> yanit = authService.tokenYenile(refreshToken);
        return ResponseEntity.ok(yanit);
    }
}
