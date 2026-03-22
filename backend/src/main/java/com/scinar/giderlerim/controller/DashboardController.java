package com.scinar.giderlerim.controller;

import com.scinar.giderlerim.dto.response.ApiResponse;
import com.scinar.giderlerim.dto.response.DashboardResponse;
import com.scinar.giderlerim.dto.response.GunlukHarcamaResponse;
import com.scinar.giderlerim.dto.response.KategoriHarcamaResponse;
import com.scinar.giderlerim.service.DashboardService;
import com.scinar.giderlerim.util.SecurityYardimcisi;
import com.scinar.giderlerim.util.TarihYardimcisi;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard(
            @RequestParam(defaultValue = "0") int ay,
            @RequestParam(defaultValue = "0") int yil) {

        Long kullaniciId = SecurityYardimcisi.mevcutKullaniciId();
        int gercekAy = ay == 0 ? TarihYardimcisi.mevcutAy() : ay;
        int gercekYil = yil == 0 ? TarihYardimcisi.mevcutYil() : yil;

        return ResponseEntity.ok(dashboardService.getDashboard(kullaniciId, gercekAy, gercekYil));
    }

    @GetMapping("/gunluk")
    public ResponseEntity<ApiResponse<List<GunlukHarcamaResponse>>> getGunlukHarcamalar(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate baslangic,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate bitis) {

        Long kullaniciId = SecurityYardimcisi.mevcutKullaniciId();
        return ResponseEntity.ok(dashboardService.getGunlukHarcamalar(kullaniciId, baslangic, bitis));
    }

    @GetMapping("/kategoriler")
    public ResponseEntity<ApiResponse<List<KategoriHarcamaResponse>>> getKategoriDagilimi(
            @RequestParam(defaultValue = "0") int ay,
            @RequestParam(defaultValue = "0") int yil) {

        Long kullaniciId = SecurityYardimcisi.mevcutKullaniciId();
        int gercekAy = ay == 0 ? TarihYardimcisi.mevcutAy() : ay;
        int gercekYil = yil == 0 ? TarihYardimcisi.mevcutYil() : yil;

        return ResponseEntity.ok(dashboardService.getKategoriDagilimi(kullaniciId, gercekAy, gercekYil));
    }
}
