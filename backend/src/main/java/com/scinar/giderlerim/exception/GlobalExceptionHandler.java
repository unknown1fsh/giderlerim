package com.scinar.giderlerim.exception;

import com.scinar.giderlerim.dto.response.HataResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(KayitBulunamadiException.class)
    public ResponseEntity<HataResponse> kayitBulunamadi(KayitBulunamadiException ex) {
        log.debug("Kayıt bulunamadı: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(HataResponse.of("KAYIT_BULUNAMADI", ex.getMessage()));
    }

    @ExceptionHandler(YetkisizErisimException.class)
    public ResponseEntity<HataResponse> yetkisizErisim(YetkisizErisimException ex) {
        log.debug("Yetkisiz erişim girişimi: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(HataResponse.of("YETKISIZ_ERISIM", ex.getMessage()));
    }

    @ExceptionHandler(PlanLimitiAsimException.class)
    public ResponseEntity<HataResponse> planLimitiAsim(PlanLimitiAsimException ex) {
        log.debug("Plan limiti aşıldı: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.PAYMENT_REQUIRED)
                .body(HataResponse.of("PLAN_LIMITI_ASIM", ex.getMessage()));
    }

    @ExceptionHandler(GecersizDosyaException.class)
    public ResponseEntity<HataResponse> gecersizDosya(GecersizDosyaException ex) {
        log.debug("Geçersiz dosya: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(HataResponse.of("GECERSIZ_DOSYA", ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<HataResponse> dogrulamaHatasi(MethodArgumentNotValidException ex) {
        List<HataResponse.AlanHatasi> alanHatalari = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(hata -> new HataResponse.AlanHatasi(
                        hata.getField(),
                        hata.getDefaultMessage()
                ))
                .collect(Collectors.toList());

        log.debug("Doğrulama hatası: {} alan hatası", alanHatalari.size());

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(HataResponse.dogrulamaHatasi(alanHatalari));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<HataResponse> erisimEngellendi(AccessDeniedException ex) {
        log.debug("Erişim engellendi");
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(HataResponse.of("ERISIM_ENGELLENDI", "Bu işlem için yetkiniz bulunmamaktadır."));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<HataResponse> gecersizArguman(IllegalArgumentException ex) {
        log.debug("Geçersiz argüman: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(HataResponse.of("GECERSIZ_ISTEK", ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<HataResponse> genelHata(Exception ex) {
        log.error("Beklenmeyen hata oluştu", ex);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(HataResponse.of("SUNUCU_HATASI", "Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyiniz."));
    }
}
