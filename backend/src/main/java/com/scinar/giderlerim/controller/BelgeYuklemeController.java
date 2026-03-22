package com.scinar.giderlerim.controller;

import com.scinar.giderlerim.dto.response.ApiResponse;
import com.scinar.giderlerim.dto.response.BelgeYuklemeResponse;
import com.scinar.giderlerim.service.BelgeYuklemeService;
import com.scinar.giderlerim.util.SecurityYardimcisi;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/belge")
@RequiredArgsConstructor
public class BelgeYuklemeController {

    private final BelgeYuklemeService belgeYuklemeService;

    @PostMapping(value = "/yukle", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<BelgeYuklemeResponse>> dosyaYukle(
            @RequestParam("dosya") MultipartFile dosya) {
        Long kullaniciId = SecurityYardimcisi.mevcutKullaniciId();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(belgeYuklemeService.dosyaYukle(kullaniciId, dosya));
    }

    @GetMapping("/{id}/durum")
    public ResponseEntity<ApiResponse<BelgeYuklemeResponse>> durumSorgula(@PathVariable Long id) {
        Long kullaniciId = SecurityYardimcisi.mevcutKullaniciId();
        return ResponseEntity.ok(belgeYuklemeService.durumSorgula(kullaniciId, id));
    }

    @GetMapping("/gecmis")
    public ResponseEntity<ApiResponse<List<BelgeYuklemeResponse>>> gecmis() {
        Long kullaniciId = SecurityYardimcisi.mevcutKullaniciId();
        return ResponseEntity.ok(belgeYuklemeService.gecmis(kullaniciId));
    }
}
