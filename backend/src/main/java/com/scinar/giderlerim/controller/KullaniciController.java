package com.scinar.giderlerim.controller;

import com.scinar.giderlerim.dto.request.ProfilGuncelleRequest;
import com.scinar.giderlerim.dto.response.ApiResponse;
import com.scinar.giderlerim.dto.response.KullaniciResponse;
import com.scinar.giderlerim.service.KullaniciService;
import com.scinar.giderlerim.util.SecurityYardimcisi;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/kullanici")
@RequiredArgsConstructor
public class KullaniciController {

    private final KullaniciService kullaniciService;

    @GetMapping("/profil")
    public ResponseEntity<ApiResponse<KullaniciResponse>> getProfil() {
        Long kullaniciId = SecurityYardimcisi.mevcutKullaniciId();
        return ResponseEntity.ok(kullaniciService.getProfil(kullaniciId));
    }

    @PutMapping("/profil")
    public ResponseEntity<ApiResponse<KullaniciResponse>> profilGuncelle(
            @Valid @RequestBody ProfilGuncelleRequest request) {
        Long kullaniciId = SecurityYardimcisi.mevcutKullaniciId();
        return ResponseEntity.ok(kullaniciService.gunceleProfil(kullaniciId, request));
    }

    @DeleteMapping("/hesap")
    public ResponseEntity<ApiResponse<Void>> hesabiSil() {
        Long kullaniciId = SecurityYardimcisi.mevcutKullaniciId();
        return ResponseEntity.ok(kullaniciService.hesabiSil(kullaniciId));
    }
}
