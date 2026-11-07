package com.scinar.giderlerim.service;

import com.scinar.giderlerim.dto.request.AiIzniRequest;
import com.scinar.giderlerim.dto.response.KullaniciResponse;
import com.scinar.giderlerim.entity.Kullanici;
import com.scinar.giderlerim.repository.KullaniciRepository;
import com.scinar.giderlerim.service.impl.KullaniciServiceImpl;
import com.scinar.giderlerim.util.AiIzinKapisi;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class KullaniciServiceImplAiIzniTest {

    @Test
    void izinVerilinceTarihVeMetinSurumuKaydedilirGeriAlininceKapanir() {
        KullaniciRepository repo = mock(KullaniciRepository.class);
        Kullanici kullanici = Kullanici.builder().id(3L).ad("A").soyad("B").email("a@b.com").build();
        when(repo.findById(3L)).thenReturn(Optional.of(kullanici));
        when(repo.save(any(Kullanici.class))).thenAnswer(inv -> inv.getArgument(0));
        KullaniciServiceImpl servis = new KullaniciServiceImpl(repo);

        assertThat(kullanici.getAiIzni()).isFalse();

        KullaniciResponse verildi = servis.aiIzniGuncelle(3L, new AiIzniRequest(true)).data();
        assertThat(verildi.aiIzni()).isTrue();
        assertThat(kullanici.getAiIzniTarihi()).isNotNull();
        assertThat(kullanici.getAiIzniMetinSurumu()).isEqualTo(AiIzinKapisi.METIN_SURUMU);

        KullaniciResponse geriAlindi = servis.aiIzniGuncelle(3L, new AiIzniRequest(false)).data();
        assertThat(geriAlindi.aiIzni()).isFalse();
        assertThat(kullanici.getAiIzniMetinSurumu()).isNull();
    }
}
