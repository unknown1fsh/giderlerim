package com.scinar.giderlerim.controller;

import com.scinar.giderlerim.dto.request.GiderGuncelleRequest;
import com.scinar.giderlerim.dto.request.GiderOlusturRequest;
import com.scinar.giderlerim.dto.response.ApiResponse;
import com.scinar.giderlerim.dto.response.GiderResponse;
import com.scinar.giderlerim.dto.response.SayfaliResponse;
import com.scinar.giderlerim.entity.enums.OdemeYontemi;
import com.scinar.giderlerim.service.GiderService;
import com.scinar.giderlerim.util.SecurityYardimcisi;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/giderler")
@RequiredArgsConstructor
public class GiderController {

    private final GiderService giderService;

    @GetMapping
    public ResponseEntity<ApiResponse<SayfaliResponse<GiderResponse>>> listele(
            @RequestParam(required = false) Long kategoriId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate baslangicTarihi,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate bitisTarihi,
            @RequestParam(required = false) OdemeYontemi odemeYontemi,
            @RequestParam(defaultValue = "0") int sayfa,
            @RequestParam(defaultValue = "20") int boyut) {

        Long kullaniciId = SecurityYardimcisi.mevcutKullaniciId();
        return ResponseEntity.ok(giderService.listele(
                kullaniciId, kategoriId, baslangicTarihi, bitisTarihi, odemeYontemi, sayfa, boyut
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<GiderResponse>> getById(@PathVariable Long id) {
        Long kullaniciId = SecurityYardimcisi.mevcutKullaniciId();
        return ResponseEntity.ok(giderService.getById(kullaniciId, id));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<GiderResponse>> olustur(
            @Valid @RequestBody GiderOlusturRequest request) {
        Long kullaniciId = SecurityYardimcisi.mevcutKullaniciId();
        return ResponseEntity.status(HttpStatus.CREATED).body(giderService.olustur(kullaniciId, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<GiderResponse>> guncelle(
            @PathVariable Long id,
            @Valid @RequestBody GiderGuncelleRequest request) {
        Long kullaniciId = SecurityYardimcisi.mevcutKullaniciId();
        return ResponseEntity.ok(giderService.guncelle(kullaniciId, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> sil(@PathVariable Long id) {
        Long kullaniciId = SecurityYardimcisi.mevcutKullaniciId();
        return ResponseEntity.ok(giderService.sil(kullaniciId, id));
    }
}
