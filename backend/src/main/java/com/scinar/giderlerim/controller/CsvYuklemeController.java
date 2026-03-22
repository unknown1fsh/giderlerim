package com.scinar.giderlerim.controller;

import com.scinar.giderlerim.dto.response.ApiResponse;
import com.scinar.giderlerim.dto.response.CsvYuklemeResponse;
import com.scinar.giderlerim.service.CsvYuklemeService;
import com.scinar.giderlerim.util.SecurityYardimcisi;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/csv")
@RequiredArgsConstructor
public class CsvYuklemeController {

    private final CsvYuklemeService csvYuklemeService;

    @PostMapping(value = "/yukle", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<CsvYuklemeResponse>> dosyaYukle(
            @RequestParam("dosya") MultipartFile dosya) {
        Long kullaniciId = SecurityYardimcisi.mevcutKullaniciId();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(csvYuklemeService.dosyaYukle(kullaniciId, dosya));
    }

    @GetMapping("/{id}/durum")
    public ResponseEntity<ApiResponse<CsvYuklemeResponse>> durumSorgula(@PathVariable Long id) {
        Long kullaniciId = SecurityYardimcisi.mevcutKullaniciId();
        return ResponseEntity.ok(csvYuklemeService.durumSorgula(kullaniciId, id));
    }

    @GetMapping("/gecmis")
    public ResponseEntity<ApiResponse<List<CsvYuklemeResponse>>> gecmis() {
        Long kullaniciId = SecurityYardimcisi.mevcutKullaniciId();
        return ResponseEntity.ok(csvYuklemeService.gecmis(kullaniciId));
    }
}
