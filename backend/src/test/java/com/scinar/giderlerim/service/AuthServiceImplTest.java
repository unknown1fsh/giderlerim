package com.scinar.giderlerim.service;

import com.scinar.giderlerim.dto.request.KayitRequest;
import com.scinar.giderlerim.entity.Kullanici;
import com.scinar.giderlerim.repository.KullaniciRepository;
import com.scinar.giderlerim.security.JwtService;
import com.scinar.giderlerim.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.ArgumentCaptor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private KullaniciRepository kullaniciRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private SistemParametresiDegerService parametreler;

    @Mock
    private ApplicationEventPublisher olayYayinci;

    @InjectMocks
    private AuthServiceImpl authService;

    @Test
    void tokenYenile_accessTokenKabulEtmemeli() {
        String accessToken = "gecerli-imzali-access-token";
        when(jwtService.isTokenExpired(accessToken)).thenReturn(false);
        when(jwtService.isRefreshToken(accessToken)).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () -> authService.tokenYenile(accessToken));

        verifyNoInteractions(kullaniciRepository);
    }

    @Test
    void kayitOl_emailiTekillikKontrolundenOnceNormalizeEtmeli() {
        KayitRequest request = new KayitRequest("Ada", "Lovelace", "  ADA@EXAMPLE.COM  ", "GucluSifre1!");
        when(parametreler.mantiksal("yeni.kayit.aktif", true)).thenReturn(true);
        when(kullaniciRepository.existsByEmail("ada@example.com")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> authService.kayitOl(request));

        verify(kullaniciRepository).existsByEmail("ada@example.com");
        verifyNoInteractions(passwordEncoder, jwtService);
    }

    @Test
    void kayitOl_yeniHesabiDogrulamaZorunluYaparVeDogrulamaEpostasiOlayiYayinlar() {
        KayitRequest request = new KayitRequest("Ada", "Lovelace", "ada@example.com", "GucluSifre1!");
        when(parametreler.mantiksal("yeni.kayit.aktif", true)).thenReturn(true);
        when(passwordEncoder.encode("GucluSifre1!")).thenReturn("hash");
        when(kullaniciRepository.save(any(Kullanici.class))).thenAnswer(inv -> {
            Kullanici k = inv.getArgument(0);
            k.setId(42L);
            return k;
        });

        authService.kayitOl(request);

        ArgumentCaptor<Kullanici> kaydedilen = ArgumentCaptor.forClass(Kullanici.class);
        verify(kullaniciRepository).save(kaydedilen.capture());
        assertThat(kaydedilen.getValue().getEmailDogrulamaZorunlu()).isTrue();
        assertThat(kaydedilen.getValue().getEmailDogrulandi()).isFalse();
        verify(olayYayinci).publishEvent(new KullaniciKaydedildiEvent("ada@example.com"));
    }
}
