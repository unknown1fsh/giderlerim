package com.scinar.giderlerim.exception;

import com.scinar.giderlerim.dto.response.HataResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

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

    @ExceptionHandler(AiIzniGerekliException.class)
    public ResponseEntity<HataResponse> aiIzniGerekli(AiIzniGerekliException ex) {
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(HataResponse.of("AI_IZNI_GEREKLI", ex.getMessage()));
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

    @ExceptionHandler({
            MissingServletRequestParameterException.class,
            MethodArgumentTypeMismatchException.class,
            HttpMessageNotReadableException.class
    })
    public ResponseEntity<HataResponse> hataliIstek(Exception ex) {
        log.debug("Hatalı istek: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(HataResponse.of("GECERSIZ_ISTEK", "İstek parametreleri eksik veya hatalı."));
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<HataResponse> kaynakBulunamadi(NoResourceFoundException ex) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(HataResponse.of("KAYNAK_BULUNAMADI", "İstenen adres bulunamadı."));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<HataResponse> kimlikDogrulamaHatasi(BadCredentialsException ex) {
        log.debug("Kimlik doğrulama başarısız");
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(HataResponse.of("KIMLIK_DOGRULAMA_HATASI", ex.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<HataResponse> gecersizArguman(IllegalArgumentException ex) {
        log.debug("Geçersiz argüman: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(HataResponse.of("GECERSIZ_ISTEK", ex.getMessage()));
    }

    @ExceptionHandler(ServisKullanilamiyorException.class)
    public ResponseEntity<HataResponse> servisKullanilamiyor(ServisKullanilamiyorException ex) {
        log.warn("Servis kullanılamıyor: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(HataResponse.of("SERVIS_KULLANILAMIYOR", ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<HataResponse> genelHata(Exception ex) {
        log.error("Beklenmeyen hata oluştu", ex);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(HataResponse.of("SUNUCU_HATASI", "Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyiniz."));
    }
}
