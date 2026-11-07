package com.scinar.giderlerim.service;

import com.scinar.giderlerim.config.OpenAiConfig;
import com.scinar.giderlerim.dto.request.SohbetMesajiRequest;
import com.scinar.giderlerim.entity.AiSohbetMesaji;
import com.scinar.giderlerim.entity.AiSohbetOturumu;
import com.scinar.giderlerim.entity.Gider;
import com.scinar.giderlerim.entity.Kategori;
import com.scinar.giderlerim.entity.Kullanici;
import com.scinar.giderlerim.entity.enums.PlanTuru;
import com.scinar.giderlerim.exception.AiIzniGerekliException;
import com.scinar.giderlerim.repository.*;
import com.scinar.giderlerim.service.impl.AiSohbetServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class AiSohbetServiceImplTest {

    @Mock OpenAiConfig openAiConfig;
    @Mock RestTemplate restTemplate;
    @Mock KullaniciRepository kullaniciRepository;
    @Mock GiderRepository giderRepository;
    @Mock ButceRepository butceRepository;
    @Mock AiSohbetOturumRepository oturumRepository;
    @Mock AiSohbetMesajiRepository mesajRepository;
    @InjectMocks AiSohbetServiceImpl servis;

    private Kullanici kullanici;

    @BeforeEach
    void kur() {
        kullanici = Kullanici.builder().id(1L).ad("Selim").soyad("Çınar").email("s@ornek.com")
                .plan(PlanTuru.PREMIUM).aiIzni(false).build();
        when(kullaniciRepository.findById(1L)).thenReturn(Optional.of(kullanici));
        when(oturumRepository.findByIdAndKullaniciIdAndDeletedAtIsNull(10L, 1L))
                .thenReturn(Optional.of(AiSohbetOturumu.builder().id(10L).kullanici(kullanici).aktif(true).baslik("Sohbet").build()));
        when(mesajRepository.save(any(AiSohbetMesaji.class))).thenAnswer(inv -> {
            AiSohbetMesaji m = inv.getArgument(0);
            m.setId(m.getId() == null ? 100L : m.getId());
            return m;
        });
        when(mesajRepository.findSonMesajlar(eq(10L), any())).thenReturn(List.of());
        Gider gider = Gider.builder().tarih(LocalDate.now()).tutar(new BigDecimal("250.00"))
                .aciklama("EFT TR330006100519786457841326 Selim ÇINAR kira")
                .kategori(Kategori.builder().ad("Kira").build()).build();
        when(giderRepository.findSon3AyGiderler(eq(1L), any())).thenReturn(List.of(gider));
        when(openAiConfig.getApiAnahtari()).thenReturn("anahtar");
        when(openAiConfig.getModel()).thenReturn("model");
        when(openAiConfig.getMaxTokens()).thenReturn(100);
        when(restTemplate.exchange(anyString(), eq(HttpMethod.POST), any(HttpEntity.class), eq(String.class)))
                .thenReturn(ResponseEntity.ok("{\"choices\":[{\"message\":{\"content\":\"Merhaba\"}}]}"));
    }

    @Test
    void izinYoksaYapayZekayaHicIstekGitmez() {
        assertThatThrownBy(() -> servis.mesajGonder(1L, 10L, new SohbetMesajiRequest("Bütçem nasıl?")))
                .isInstanceOf(AiIzniGerekliException.class);

        verifyNoInteractions(restTemplate);
        verify(mesajRepository, never()).save(any());
    }

    @Test
    void izinVarsaGonderilenIcerikMaskelenir() {
        kullanici.setAiIzni(true);

        servis.mesajGonder(1L, 10L, new SohbetMesajiRequest("Ben Selim, kartım 4111 1111 1111 1111, tel 0553 140 56 62"));

        @SuppressWarnings("unchecked")
        ArgumentCaptor<HttpEntity<Object>> istek = ArgumentCaptor.forClass(HttpEntity.class);
        verify(restTemplate).exchange(anyString(), eq(HttpMethod.POST), istek.capture(), eq(String.class));
        String govde = String.valueOf(istek.getValue().getBody());

        assertThat(govde)
                .doesNotContain("4111 1111 1111 1111")
                .doesNotContain("0553 140 56 62")
                .doesNotContain("TR330006100519786457841326")
                .doesNotContain("Selim")
                .doesNotContainIgnoringCase("çınar")
                .contains("[KART]", "[TELEFON]", "[IBAN]", "[AD]", "Kira");
    }
}
