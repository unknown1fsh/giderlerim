package com.scinar.giderlerim.controller;

import com.scinar.giderlerim.dto.response.AiAnalizResponse;
import com.scinar.giderlerim.dto.response.ApiResponse;
import com.scinar.giderlerim.service.AiAnalizService;
import com.scinar.giderlerim.util.SecurityYardimcisi;
import com.scinar.giderlerim.util.TarihYardimcisi;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ai/analiz")
@RequiredArgsConstructor
public class AiAnalizController {

    private final AiAnalizService aiAnalizService;

    @GetMapping("/harcama")
    public ResponseEntity<ApiResponse<AiAnalizResponse>> harcamaAnalizi(
            @RequestParam(defaultValue = "0") int ay,
            @RequestParam(defaultValue = "0") int yil) {

        Long kullaniciId = SecurityYardimcisi.mevcutKullaniciId();
        int gercekAy = ay == 0 ? TarihYardimcisi.mevcutAy() : ay;
        int gercekYil = yil == 0 ? TarihYardimcisi.mevcutYil() : yil;

        return ResponseEntity.ok(aiAnalizService.harcamaAnaliziYap(kullaniciId, gercekAy, gercekYil));
    }

    @GetMapping("/butce-onerisi")
    public ResponseEntity<ApiResponse<AiAnalizResponse>> butceOnerisi() {
        Long kullaniciId = SecurityYardimcisi.mevcutKullaniciId();
        return ResponseEntity.ok(aiAnalizService.butceOnerisiAl(kullaniciId));
    }

    @GetMapping("/anomali")
    public ResponseEntity<ApiResponse<AiAnalizResponse>> anomaliTespiti() {
        Long kullaniciId = SecurityYardimcisi.mevcutKullaniciId();
        return ResponseEntity.ok(aiAnalizService.anomaliTespitEt(kullaniciId));
    }

    @GetMapping("/tasarruf")
    public ResponseEntity<ApiResponse<AiAnalizResponse>> tasarrufFirsatlari() {
        Long kullaniciId = SecurityYardimcisi.mevcutKullaniciId();
        return ResponseEntity.ok(aiAnalizService.tasarrufFirsatlariniGoster(kullaniciId));
    }
}
