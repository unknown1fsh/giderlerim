package com.scinar.giderlerim.exception;

import com.scinar.giderlerim.dto.response.HataResponse;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import static org.assertj.core.api.Assertions.assertThat;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void hataliKimlikBilgisi401Doner() {
        ResponseEntity<HataResponse> yanit =
                handler.kimlikDogrulamaHatasi(new BadCredentialsException("E-posta veya şifre hatalı."));

        assertThat(yanit.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(yanit.getBody().hataKodu()).isEqualTo("KIMLIK_DOGRULAMA_HATASI");
        assertThat(yanit.getBody().message()).isEqualTo("E-posta veya şifre hatalı.");
    }

    @Test
    void eksikParametre400Doner() {
        ResponseEntity<HataResponse> yanit =
                handler.hataliIstek(new MissingServletRequestParameterException("baslangic", "LocalDate"));

        assertThat(yanit.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(yanit.getBody().hataKodu()).isEqualTo("GECERSIZ_ISTEK");
    }

    @Test
    void olmayanAdres404Doner() {
        ResponseEntity<HataResponse> yanit =
                handler.kaynakBulunamadi(new NoResourceFoundException(HttpMethod.GET, "api/v1/yok"));

        assertThat(yanit.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(yanit.getBody().hataKodu()).isEqualTo("KAYNAK_BULUNAMADI");
    }
}
