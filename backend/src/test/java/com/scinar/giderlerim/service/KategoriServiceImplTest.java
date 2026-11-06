package com.scinar.giderlerim.service;

import com.scinar.giderlerim.dto.request.KategoriGuncelleRequest;
import com.scinar.giderlerim.dto.request.KategoriOlusturRequest;
import com.scinar.giderlerim.dto.response.ApiResponse;
import com.scinar.giderlerim.dto.response.KategoriResponse;
import com.scinar.giderlerim.entity.Kategori;
import com.scinar.giderlerim.entity.Kullanici;
import com.scinar.giderlerim.exception.KayitBulunamadiException;
import com.scinar.giderlerim.exception.YetkisizErisimException;
import com.scinar.giderlerim.repository.KategoriRepository;
import com.scinar.giderlerim.repository.KullaniciRepository;
import com.scinar.giderlerim.service.impl.KategoriServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class KategoriServiceImplTest {

    @Mock
    KategoriRepository kategoriRepository;

    @Mock
    KullaniciRepository kullaniciRepository;

    KategoriServiceImpl kategoriService;

    @BeforeEach
    void setUp() {
        kategoriService = new KategoriServiceImpl(kategoriRepository, kullaniciRepository);
    }

    @Test
    void listele_entityleriResponseModelineDonusturur() {
        Kategori kategori = kategori(7L, kullanici(3L), "Market", false);
        when(kategoriRepository.findAllByKullaniciId(3L)).thenReturn(List.of(kategori));

        ApiResponse<List<KategoriResponse>> response = kategoriService.listele(3L);

        assertThat(response.success()).isTrue();
        assertThat(response.data()).singleElement().satisfies(item -> {
            assertThat(item.id()).isEqualTo(7L);
            assertThat(item.ad()).isEqualTo("Market");
            assertThat(item.sistemMi()).isFalse();
        });
    }

    @Test
    void olustur_bosOpsiyonelAlanlardaVarsayilanlariKullanir() {
        Kullanici kullanici = kullanici(3L);
        when(kullaniciRepository.findById(3L)).thenReturn(Optional.of(kullanici));
        when(kategoriRepository.save(any(Kategori.class))).thenAnswer(invocation -> {
            Kategori kaydedilen = invocation.getArgument(0);
            kaydedilen.setId(11L);
            return kaydedilen;
        });

        ApiResponse<KategoriResponse> response = kategoriService.olustur(
                3L,
                new KategoriOlusturRequest("  Ulaşım  ", null, null)
        );

        assertThat(response.data().ad()).isEqualTo("Ulaşım");
        assertThat(response.data().ikon()).isEqualTo("tag");
        assertThat(response.data().renk()).isEqualTo("#6B7280");
    }

    @Test
    void olustur_kullaniciYoksaKayitBulunamadiHatasiVerir() {
        when(kullaniciRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> kategoriService.olustur(
                99L,
                new KategoriOlusturRequest("Market", null, null)
        )).isInstanceOf(KayitBulunamadiException.class);

        verify(kategoriRepository, never()).save(any());
    }

    @Test
    void guncelle_baskaKullanicininKategorisiniDegistirmez() {
        Kategori kategori = kategori(7L, kullanici(4L), "Market", false);
        when(kategoriRepository.findByIdAndDeletedAtIsNull(7L)).thenReturn(Optional.of(kategori));

        assertThatThrownBy(() -> kategoriService.guncelle(
                3L,
                7L,
                new KategoriGuncelleRequest("Yeni ad", null, null)
        )).isInstanceOf(YetkisizErisimException.class);

        verify(kategoriRepository, never()).save(any());
    }

    @Test
    void sil_sistemKategorisiniSilmez() {
        Kategori kategori = kategori(7L, null, "Market", true);
        when(kategoriRepository.findByIdAndDeletedAtIsNull(7L)).thenReturn(Optional.of(kategori));

        assertThatThrownBy(() -> kategoriService.sil(3L, 7L))
                .isInstanceOf(YetkisizErisimException.class);

        assertThat(kategori.getDeletedAt()).isNull();
        verify(kategoriRepository, never()).save(any());
    }

    @Test
    void sil_sahibininKategorisiniSoftDeleteYapar() {
        Kategori kategori = kategori(7L, kullanici(3L), "Market", false);
        when(kategoriRepository.findByIdAndDeletedAtIsNull(7L)).thenReturn(Optional.of(kategori));

        ApiResponse<Void> response = kategoriService.sil(3L, 7L);

        assertThat(response.success()).isTrue();
        assertThat(kategori.getAktif()).isFalse();
        assertThat(kategori.getDeletedAt()).isNotNull();
        verify(kategoriRepository).save(kategori);
    }

    private Kullanici kullanici(Long id) {
        return Kullanici.builder()
                .id(id)
                .ad("Test")
                .soyad("Kullanıcı")
                .email("test" + id + "@example.com")
                .sifreHash("hash")
                .build();
    }

    private Kategori kategori(Long id, Kullanici kullanici, String ad, boolean sistemMi) {
        return Kategori.builder()
                .id(id)
                .kullanici(kullanici)
                .ad(ad)
                .ikon("tag")
                .renk("#6B7280")
                .sistemMi(sistemMi)
                .aktif(true)
                .build();
    }
}
