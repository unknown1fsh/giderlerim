package com.scinar.giderlerim.controller;

import com.scinar.giderlerim.dto.request.KategoriGuncelleRequest;
import com.scinar.giderlerim.dto.request.KategoriOlusturRequest;
import com.scinar.giderlerim.dto.response.ApiResponse;
import com.scinar.giderlerim.dto.response.KategoriResponse;
import com.scinar.giderlerim.service.KategoriService;
import com.scinar.giderlerim.util.SecurityYardimcisi;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/kategoriler")
@RequiredArgsConstructor
public class KategoriController {

    private final KategoriService kategoriService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<KategoriResponse>>> listele() {
        Long kullaniciId = SecurityYardimcisi.mevcutKullaniciId();
        return ResponseEntity.ok(kategoriService.listele(kullaniciId));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<KategoriResponse>> olustur(
            @Valid @RequestBody KategoriOlusturRequest request) {
        Long kullaniciId = SecurityYardimcisi.mevcutKullaniciId();
        return ResponseEntity.status(HttpStatus.CREATED).body(kategoriService.olustur(kullaniciId, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<KategoriResponse>> guncelle(
            @PathVariable Long id,
            @Valid @RequestBody KategoriGuncelleRequest request) {
        Long kullaniciId = SecurityYardimcisi.mevcutKullaniciId();
        return ResponseEntity.ok(kategoriService.guncelle(kullaniciId, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> sil(@PathVariable Long id) {
        Long kullaniciId = SecurityYardimcisi.mevcutKullaniciId();
        return ResponseEntity.ok(kategoriService.sil(kullaniciId, id));
    }
}
