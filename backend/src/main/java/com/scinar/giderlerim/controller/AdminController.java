package com.scinar.giderlerim.controller;

import com.scinar.giderlerim.dto.admin.*;
import com.scinar.giderlerim.dto.response.ApiResponse;
import com.scinar.giderlerim.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    // ── İstatistikler ──────────────────────────────────────────────────────

    @GetMapping("/istatistikler")
    public ResponseEntity<ApiResponse<AdminIstatistikDto>> getIstatistikler() {
        return ResponseEntity.ok(adminService.getIstatistikler());
    }

    // ── Kullanıcı Yönetimi ─────────────────────────────────────────────────

    @GetMapping("/kullanicilar")
    public ResponseEntity<ApiResponse<Page<AdminKullaniciListeDto>>> kullanicilariListele(
            @RequestParam(required = false) String arama,
            @RequestParam(required = false) String plan,
            @RequestParam(required = false) Boolean aktif,
            @RequestParam(defaultValue = "0") int sayfa,
            @RequestParam(defaultValue = "20") int boyut,
            @RequestParam(defaultValue = "createdAt") String siralama,
            @RequestParam(defaultValue = "desc") String yon) {

        Sort sort = yon.equalsIgnoreCase("asc")
                ? Sort.by(siralama).ascending()
                : Sort.by(siralama).descending();
        Pageable pageable = PageRequest.of(sayfa, boyut, sort);

        return ResponseEntity.ok(adminService.kullanicilariListele(arama, plan, aktif, pageable));
    }

    @GetMapping("/kullanicilar/{id}")
    public ResponseEntity<ApiResponse<AdminKullaniciListeDto>> kullaniciGetir(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.kullaniciGetir(id));
    }

    @PutMapping("/kullanicilar/{id}")
    public ResponseEntity<ApiResponse<AdminKullaniciListeDto>> kullaniciGuncelle(
            @PathVariable Long id,
            @RequestBody AdminKullaniciGuncelleRequest request) {
        return ResponseEntity.ok(adminService.kullaniciGuncelle(id, request));
    }

    @DeleteMapping("/kullanicilar/{id}")
    public ResponseEntity<ApiResponse<Void>> kullaniciSil(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.kullaniciSil(id));
    }

    // ── Sistem Parametreleri ───────────────────────────────────────────────

    @GetMapping("/sistem-parametreleri")
    public ResponseEntity<ApiResponse<List<SistemParametresiDto>>> parametreleriListele() {
        return ResponseEntity.ok(adminService.parametreleriListele());
    }

    @PostMapping("/sistem-parametreleri")
    public ResponseEntity<ApiResponse<SistemParametresiDto>> parametreOlustur(
            @Valid @RequestBody SistemParametresiOlusturRequest request) {
        return ResponseEntity.ok(adminService.parametreOlustur(request));
    }

    @PutMapping("/sistem-parametreleri/{id}")
    public ResponseEntity<ApiResponse<SistemParametresiDto>> parametreGuncelle(
            @PathVariable Long id,
            @Valid @RequestBody SistemParametresiGuncelleRequest request) {
        return ResponseEntity.ok(adminService.parametreGuncelle(id, request));
    }

    @PutMapping("/sistem-parametreleri/{id}/varsayilan")
    public ResponseEntity<ApiResponse<SistemParametresiDto>> parametreVarsayilanaGetir(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.parametreVarsayilanaGetir(id));
    }

    @DeleteMapping("/sistem-parametreleri/{id}")
    public ResponseEntity<ApiResponse<Void>> parametreSil(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.parametreSil(id));
    }
}
