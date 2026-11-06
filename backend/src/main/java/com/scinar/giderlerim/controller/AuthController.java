package com.scinar.giderlerim.controller;

import com.scinar.giderlerim.dto.request.*;
import com.scinar.giderlerim.dto.response.ApiResponse;
import com.scinar.giderlerim.dto.response.TokenResponse;
import com.scinar.giderlerim.service.AuthService;
import com.scinar.giderlerim.service.HesapGuvenligiService;
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
    private final HesapGuvenligiService hesapGuvenligiService;

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

    @PostMapping("/email-dogrulama-talep")
    public ApiResponse<Void> emailDogrulamaTalepEt(@Valid @RequestBody EmailRequest request) {
        hesapGuvenligiService.emailDogrulamaTalepEt(request.email());
        return ApiResponse.basarili("Hesap uygunsa doğrulama bağlantısı gönderildi.", null);
    }

    @PostMapping("/email-dogrula")
    public ApiResponse<Void> emailDogrula(@Valid @RequestBody TokenRequest request) {
        hesapGuvenligiService.emailDogrula(request.token());
        return ApiResponse.basarili("E-posta adresiniz doğrulandı.", null);
    }

    @PostMapping("/sifre-sifirlama-talep")
    public ApiResponse<Void> sifreSifirlamaTalepEt(@Valid @RequestBody EmailRequest request) {
        hesapGuvenligiService.sifreSifirlamaTalepEt(request.email());
        return ApiResponse.basarili("Hesap uygunsa şifre sıfırlama bağlantısı gönderildi.", null);
    }

    @PostMapping("/sifre-sifirla")
    public ApiResponse<Void> sifreSifirla(@Valid @RequestBody SifreSifirlaRequest request) {
        hesapGuvenligiService.sifreSifirla(request.token(), request.yeniSifre());
        return ApiResponse.basarili("Şifreniz güncellendi.", null);
    }
}
