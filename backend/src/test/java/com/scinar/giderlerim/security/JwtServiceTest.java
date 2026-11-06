package com.scinar.giderlerim.security;

import com.scinar.giderlerim.service.SistemParametresiDegerService;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;

class JwtServiceTest {

    private JwtService anahtarla(String anahtar) {
        JwtService servis = new JwtService(mock(SistemParametresiDegerService.class));
        ReflectionTestUtils.setField(servis, "gizliAnahtar", anahtar);
        return servis;
    }

    @Test
    void bosAnahtarlaAcilmaz() {
        assertThatThrownBy(() -> anahtarla("").anahtariDogrula())
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("JWT_SECRET");
    }

    @Test
    void kisaAnahtarlaAcilmaz() {
        assertThatThrownBy(() -> anahtarla("kisa-anahtar").anahtariDogrula())
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void yeterliUzunluktakiAnahtarKabulEdilir() {
        assertThatCode(() -> anahtarla("a".repeat(JwtService.MIN_ANAHTAR_BAYT)).anahtariDogrula())
                .doesNotThrowAnyException();
    }
}
