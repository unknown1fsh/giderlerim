package com.scinar.giderlerim.controller;

import com.scinar.giderlerim.dto.response.ApiResponse;
import com.scinar.giderlerim.dto.response.SayfaliResponse;
import com.scinar.giderlerim.dto.response.UyariResponse;
import com.scinar.giderlerim.service.UyariService;
import com.scinar.giderlerim.util.SecurityYardimcisi;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/uyarilar")
@RequiredArgsConstructor
public class UyariController {

    private final UyariService uyariService;

    @GetMapping
    public ResponseEntity<ApiResponse<SayfaliResponse<UyariResponse>>> listele(
            @RequestParam(defaultValue = "0") int sayfa,
            @RequestParam(defaultValue = "20") int boyut) {
        Long kullaniciId = SecurityYardimcisi.mevcutKullaniciId();
        return ResponseEntity.ok(uyariService.listele(kullaniciId, sayfa, boyut));
    }

    @PutMapping("/{id}/okundu")
    public ResponseEntity<ApiResponse<UyariResponse>> okunduIsaretle(@PathVariable Long id) {
        Long kullaniciId = SecurityYardimcisi.mevcutKullaniciId();
        return ResponseEntity.ok(uyariService.okunduIsaretle(kullaniciId, id));
    }

    @PutMapping("/tumu-okundu")
    public ResponseEntity<ApiResponse<Void>> tumunuOkunduIsaretle() {
        Long kullaniciId = SecurityYardimcisi.mevcutKullaniciId();
        return ResponseEntity.ok(uyariService.tumunuOkunduIsaretle(kullaniciId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> sil(@PathVariable Long id) {
        Long kullaniciId = SecurityYardimcisi.mevcutKullaniciId();
        return ResponseEntity.ok(uyariService.sil(kullaniciId, id));
    }

    @GetMapping("/sayac")
    public ResponseEntity<ApiResponse<Long>> sayac() {
        Long kullaniciId = SecurityYardimcisi.mevcutKullaniciId();
        return ResponseEntity.ok(uyariService.sayac(kullaniciId));
    }
}
