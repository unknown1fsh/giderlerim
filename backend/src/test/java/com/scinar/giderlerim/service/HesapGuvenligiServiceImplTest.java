package com.scinar.giderlerim.service;

import com.scinar.giderlerim.entity.HesapToken;
import com.scinar.giderlerim.entity.Kullanici;
import com.scinar.giderlerim.entity.enums.HesapTokenTuru;
import com.scinar.giderlerim.exception.ServisKullanilamiyorException;
import com.scinar.giderlerim.repository.HesapTokenRepository;
import com.scinar.giderlerim.repository.KullaniciRepository;
import com.scinar.giderlerim.service.impl.HesapGuvenligiServiceImpl;
import com.scinar.giderlerim.util.HesapTokenGuvenligi;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HesapGuvenligiServiceImplTest {

    @Mock HesapTokenRepository tokenRepository;
    @Mock KullaniciRepository kullaniciRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock EpostaGonderici epostaGonderici;
    @InjectMocks HesapGuvenligiServiceImpl service;

    @Test
    void smtpKapaliykenTokenUretmez() {
        when(epostaGonderici.kullanilabilir()).thenReturn(false);

        assertThatThrownBy(() -> service.sifreSifirlamaTalepEt("ada@example.com"))
                .isInstanceOf(ServisKullanilamiyorException.class);

        verifyNoInteractions(kullaniciRepository, tokenRepository, passwordEncoder);
    }

    @Test
    void kullanilmisResetTokeniIkinciKezKabulEtmez() {
        String hamToken = HesapTokenGuvenligi.yeniToken();
        HesapToken token = HesapToken.builder()
                .tur(HesapTokenTuru.SIFRE_SIFIRLAMA)
                .kullanici(new Kullanici())
                .sonKullanmaTarihi(LocalDateTime.now().plusMinutes(10))
                .kullanildiAt(LocalDateTime.now().minusMinutes(1))
                .build();
        when(tokenRepository.findByTokenHashAndTur(
                HesapTokenGuvenligi.hash(hamToken), HesapTokenTuru.SIFRE_SIFIRLAMA))
                .thenReturn(Optional.of(token));

        assertThatThrownBy(() -> service.sifreSifirla(hamToken, "YeniSifre1!"))
                .isInstanceOf(IllegalArgumentException.class);

        verifyNoInteractions(passwordEncoder);
    }

    @Test
    void bilinmeyenEmailTalebiHesapVarliginiAciklamazVeTokenUretmez() {
        when(epostaGonderici.kullanilabilir()).thenReturn(true);
        when(kullaniciRepository.findByEmailAndDeletedAtIsNull("ada@example.com"))
                .thenReturn(Optional.empty());

        service.emailDogrulamaTalepEt("  ADA@EXAMPLE.COM ");

        verifyNoInteractions(tokenRepository, passwordEncoder);
        verify(epostaGonderici, never()).hesapBaglantisiGonder(any(), any(), any(), any());
    }

    @Test
    void zatenDogrulanmisHesabaDogrulamaEpostasiGondermez() {
        when(epostaGonderici.kullanilabilir()).thenReturn(true);
        when(kullaniciRepository.findByEmailAndDeletedAtIsNull("ada@example.com"))
                .thenReturn(Optional.of(Kullanici.builder().email("ada@example.com").emailDogrulandi(true).build()));

        service.emailDogrulamaTalepEt("ada@example.com");

        verifyNoInteractions(tokenRepository);
        verify(epostaGonderici, never()).hesapBaglantisiGonder(any(), any(), any(), any());
    }

    @Test
    void sifreSifirlamaEpostaSahipliginiKanitlarVeHesabiDogrular() {
        String hamToken = HesapTokenGuvenligi.yeniToken();
        Kullanici kullanici = Kullanici.builder().emailDogrulandi(false).emailDogrulamaZorunlu(true).build();
        HesapToken token = HesapToken.builder()
                .tur(HesapTokenTuru.SIFRE_SIFIRLAMA)
                .kullanici(kullanici)
                .sonKullanmaTarihi(LocalDateTime.now().plusMinutes(10))
                .build();
        when(tokenRepository.findByTokenHashAndTur(HesapTokenGuvenligi.hash(hamToken), HesapTokenTuru.SIFRE_SIFIRLAMA))
                .thenReturn(Optional.of(token));
        when(passwordEncoder.encode("YeniSifre1!")).thenReturn("yeni-hash");

        service.sifreSifirla(hamToken, "YeniSifre1!");

        org.assertj.core.api.Assertions.assertThat(kullanici.getSifreHash()).isEqualTo("yeni-hash");
        org.assertj.core.api.Assertions.assertThat(kullanici.getEmailDogrulandi()).isTrue();
        org.assertj.core.api.Assertions.assertThat(token.getKullanildiAt()).isNotNull();
    }
}
