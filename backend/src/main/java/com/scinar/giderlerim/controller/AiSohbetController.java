package com.scinar.giderlerim.controller;

import com.scinar.giderlerim.dto.request.SohbetMesajiRequest;
import com.scinar.giderlerim.dto.response.ApiResponse;
import com.scinar.giderlerim.dto.response.SohbetMesajiResponse;
import com.scinar.giderlerim.dto.response.SohbetOturumResponse;
import com.scinar.giderlerim.service.AiSohbetService;
import com.scinar.giderlerim.util.SecurityYardimcisi;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/ai/sohbet")
@RequiredArgsConstructor
public class AiSohbetController {

    private final AiSohbetService aiSohbetService;

    @GetMapping("/oturumlar")
    public ResponseEntity<ApiResponse<List<SohbetOturumResponse>>> getOturumlar() {
        Long kullaniciId = SecurityYardimcisi.mevcutKullaniciId();
        return ResponseEntity.ok(aiSohbetService.getOturumlar(kullaniciId));
    }

    @PostMapping("/oturumlar")
    public ResponseEntity<ApiResponse<SohbetOturumResponse>> yeniOturumBaslat() {
        Long kullaniciId = SecurityYardimcisi.mevcutKullaniciId();
        return ResponseEntity.status(HttpStatus.CREATED).body(aiSohbetService.yeniOturumBaslat(kullaniciId));
    }

    @GetMapping("/oturumlar/{id}/mesajlar")
    public ResponseEntity<ApiResponse<List<SohbetMesajiResponse>>> getMesajlar(
            @PathVariable Long id) {
        Long kullaniciId = SecurityYardimcisi.mevcutKullaniciId();
        return ResponseEntity.ok(aiSohbetService.getMesajlar(kullaniciId, id));
    }

    @PostMapping("/oturumlar/{id}/mesajlar")
    public ResponseEntity<ApiResponse<SohbetMesajiResponse>> mesajGonder(
            @PathVariable Long id,
            @Valid @RequestBody SohbetMesajiRequest request) {
        Long kullaniciId = SecurityYardimcisi.mevcutKullaniciId();
        return ResponseEntity.ok(aiSohbetService.mesajGonder(kullaniciId, id, request));
    }

    @DeleteMapping("/oturumlar/{id}")
    public ResponseEntity<ApiResponse<Void>> oturumKapat(@PathVariable Long id) {
        Long kullaniciId = SecurityYardimcisi.mevcutKullaniciId();
        return ResponseEntity.ok(aiSohbetService.oturumKapat(kullaniciId, id));
    }
}
