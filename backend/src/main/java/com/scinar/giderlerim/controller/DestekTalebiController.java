package com.scinar.giderlerim.controller;

import com.scinar.giderlerim.dto.request.DestekTalebiOlusturRequest;
import com.scinar.giderlerim.dto.response.ApiResponse;
import com.scinar.giderlerim.dto.response.DestekTalebiResponse;
import com.scinar.giderlerim.dto.response.SayfaliResponse;
import com.scinar.giderlerim.service.DestekTalebiService;
import com.scinar.giderlerim.util.SecurityYardimcisi;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/destek-talepleri")
@RequiredArgsConstructor
public class DestekTalebiController {

    private final DestekTalebiService destekTalebiService;

    @PostMapping
    public ResponseEntity<ApiResponse<DestekTalebiResponse>> olustur(
            @Valid @RequestBody DestekTalebiOlusturRequest request) {
        Long kullaniciId = SecurityYardimcisi.mevcutKullaniciId();
        return ResponseEntity.ok(destekTalebiService.olustur(kullaniciId, request));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<SayfaliResponse<DestekTalebiResponse>>> listele(
            @RequestParam(defaultValue = "0") int sayfa,
            @RequestParam(defaultValue = "20") int boyut) {
        Long kullaniciId = SecurityYardimcisi.mevcutKullaniciId();
        return ResponseEntity.ok(destekTalebiService.kullaniciTalepleri(kullaniciId, sayfa, boyut));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DestekTalebiResponse>> getir(@PathVariable Long id) {
        Long kullaniciId = SecurityYardimcisi.mevcutKullaniciId();
        return ResponseEntity.ok(destekTalebiService.kullaniciTalebiGetir(kullaniciId, id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> sil(@PathVariable Long id) {
        Long kullaniciId = SecurityYardimcisi.mevcutKullaniciId();
        return ResponseEntity.ok(destekTalebiService.sil(kullaniciId, id));
    }
}
