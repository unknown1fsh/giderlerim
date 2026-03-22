package com.scinar.giderlerim.controller;

import com.scinar.giderlerim.dto.request.ButceGuncelleRequest;
import com.scinar.giderlerim.dto.request.ButceOlusturRequest;
import com.scinar.giderlerim.dto.response.ApiResponse;
import com.scinar.giderlerim.dto.response.ButceOzetResponse;
import com.scinar.giderlerim.dto.response.ButceResponse;
import com.scinar.giderlerim.service.ButceService;
import com.scinar.giderlerim.util.SecurityYardimcisi;
import com.scinar.giderlerim.util.TarihYardimcisi;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/butceler")
@RequiredArgsConstructor
public class ButceController {

    private final ButceService butceService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ButceResponse>>> listele(
            @RequestParam(defaultValue = "0") int ay,
            @RequestParam(defaultValue = "0") int yil) {

        Long kullaniciId = SecurityYardimcisi.mevcutKullaniciId();
        int gercekAy = ay == 0 ? TarihYardimcisi.mevcutAy() : ay;
        int gercekYil = yil == 0 ? TarihYardimcisi.mevcutYil() : yil;

        return ResponseEntity.ok(butceService.listele(kullaniciId, gercekAy, gercekYil));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ButceResponse>> olustur(
            @Valid @RequestBody ButceOlusturRequest request) {
        Long kullaniciId = SecurityYardimcisi.mevcutKullaniciId();
        return ResponseEntity.status(HttpStatus.CREATED).body(butceService.olustur(kullaniciId, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ButceResponse>> guncelle(
            @PathVariable Long id,
            @Valid @RequestBody ButceGuncelleRequest request) {
        Long kullaniciId = SecurityYardimcisi.mevcutKullaniciId();
        return ResponseEntity.ok(butceService.guncelle(kullaniciId, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> sil(@PathVariable Long id) {
        Long kullaniciId = SecurityYardimcisi.mevcutKullaniciId();
        return ResponseEntity.ok(butceService.sil(kullaniciId, id));
    }

    @GetMapping("/ozet")
    public ResponseEntity<ApiResponse<List<ButceOzetResponse>>> ozet(
            @RequestParam(defaultValue = "0") int ay,
            @RequestParam(defaultValue = "0") int yil) {

        Long kullaniciId = SecurityYardimcisi.mevcutKullaniciId();
        int gercekAy = ay == 0 ? TarihYardimcisi.mevcutAy() : ay;
        int gercekYil = yil == 0 ? TarihYardimcisi.mevcutYil() : yil;

        return ResponseEntity.ok(butceService.getAylikOzetler(kullaniciId, gercekAy, gercekYil));
    }
}
