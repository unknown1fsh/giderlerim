package com.scinar.giderlerim.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.scinar.giderlerim.config.ShopierAyarlari;
import com.scinar.giderlerim.entity.Kullanici;
import com.scinar.giderlerim.entity.ShopierSiparisi;
import com.scinar.giderlerim.entity.enums.AbonelikDonemi;
import com.scinar.giderlerim.entity.enums.PlanTuru;
import com.scinar.giderlerim.entity.enums.SiparisDurumu;
import com.scinar.giderlerim.repository.KullaniciRepository;
import com.scinar.giderlerim.repository.OdemeBildirimiRepository;
import com.scinar.giderlerim.repository.ShopierSiparisiRepository;
import com.scinar.giderlerim.service.impl.ShopierOdemeServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class ShopierOdemeServiceImplTest {

    private OdemeBildirimiRepository bildirimRepository;
    private ShopierSiparisiRepository siparisRepository;
    private KullaniciRepository kullaniciRepository;
    private AbonelikService abonelikService;
    private ShopierOdemeServiceImpl servis;
    private Kullanici kullanici;

    @BeforeEach
    void kur() {
        bildirimRepository = mock(OdemeBildirimiRepository.class);
        siparisRepository = mock(ShopierSiparisiRepository.class);
        kullaniciRepository = mock(KullaniciRepository.class);
        abonelikService = mock(AbonelikService.class);
        ShopierAyarlari ayarlar = new ShopierAyarlari(Map.of(
                "46065275", new ShopierAyarlari.UrunTanimi(PlanTuru.PREMIUM, AbonelikDonemi.AYLIK, new BigDecimal("99.00")),
                "46065493", new ShopierAyarlari.UrunTanimi(PlanTuru.ULTRA, AbonelikDonemi.YILLIK, new BigDecimal("1908.00"))));
        servis = new ShopierOdemeServiceImpl(bildirimRepository, siparisRepository, kullaniciRepository,
                abonelikService, ayarlar, new ObjectMapper());

        kullanici = Kullanici.builder().id(5L).email("musteri@ornek.com").plan(PlanTuru.FREE).build();
        when(siparisRepository.findByShopierSiparisId(anyString())).thenReturn(Optional.empty());
        when(siparisRepository.save(any(ShopierSiparisi.class))).thenAnswer(inv -> inv.getArgument(0));
        when(kullaniciRepository.findByEmailAndDeletedAtIsNull("musteri@ornek.com")).thenReturn(Optional.of(kullanici));
    }

    private static byte[] siparis(String id, String odeme, String urunId, String tutar, String paraBirimi, String email) {
        return ("""
                {"id":"%s","paymentStatus":"%s","currency":"%s","totals":{"total":"%s"},
                 "billingInfo":{"email":"%s"},"lineItems":[{"productId":"%s","quantity":1}]}
                """.formatted(id, odeme, paraBirimi, tutar, email, urunId)).getBytes(StandardCharsets.UTF_8);
    }

    private ShopierSiparisi kaydedilenSiparis() {
        ArgumentCaptor<ShopierSiparisi> yakalanan = ArgumentCaptor.forClass(ShopierSiparisi.class);
        verify(siparisRepository, atLeastOnce()).save(yakalanan.capture());
        return yakalanan.getValue();
    }

    @Test
    void odenmisTanimliUrunKullaniciyaAbonelikBaslatir() {
        servis.bildirimIsle("wh-1", "order.created",
                siparis("S1", "paid", "46065275", "99.00", "TRY", "Musteri@Ornek.com "));

        ShopierSiparisi s = kaydedilenSiparis();
        assertThat(s.getDurum()).isEqualTo(SiparisDurumu.ISLENDI);
        assertThat(s.getAliciEmail()).isEqualTo("musteri@ornek.com");
        assertThat(s.getKullanici()).isSameAs(kullanici);
        verify(abonelikService).shopierAboneligiBaslat(kullanici, PlanTuru.PREMIUM, AbonelikDonemi.AYLIK, s);
    }

    /** Shopier'den gelen gerçek bir order.created gövdesinin yapısı (kişisel veriler değiştirildi). */
    private static final String GERCEK_SIPARIS_GOVDESI = """
            {"id":"516182454","status":"unfulfilled","paymentStatus":"paid","installments":false,
             "dateCreated":"2026-11-07T02:27:16+0300","currency":"TRY","paymentMethod":"creditCard",
             "totals":{"subtotal":"%s","shipping":"0.00","discount":"0.00","total":"%s"},"discounts":[],
             "shippingInfo":{"firstName":"AD","lastName":"SOYAD","nationalId":"","email":"musteri@ornek.com",
               "phone":"+90 500 000 00 00","company":"","address":"Dijital ürün","district":"","city":"","state":"",
               "postcode":"","country":"Türkiye"},
             "billingInfo":{},"note":"",
             "lineItems":[{"productId":"%s","title":"test","type":"digital","selection":[],"options":[],
               "quantity":1,"price":"%s","total":"%s"}],
             "fulfillments":[],"returns":[],"refunds":[]}
            """;

    private static byte[] gercekSiparis(String urunId, String tutar) {
        return GERCEK_SIPARIS_GOVDESI.formatted(tutar, tutar, urunId, tutar, tutar).getBytes(StandardCharsets.UTF_8);
    }

    @Test
    void gercekGovdeBosFaturaBilgisindeTeslimatEpostasiylaEslesir() {
        servis.bildirimIsle("wh-gercek-1", "order.created", gercekSiparis("46065275", "99.00"));

        ShopierSiparisi s = kaydedilenSiparis();
        assertThat(s.getDurum()).isEqualTo(SiparisDurumu.ISLENDI);
        assertThat(s.getShopierSiparisId()).isEqualTo("516182454");
        assertThat(s.getAliciEmail()).isEqualTo("musteri@ornek.com");
        assertThat(s.getTutar()).isEqualByComparingTo("99.00");
        verify(abonelikService).shopierAboneligiBaslat(kullanici, PlanTuru.PREMIUM, AbonelikDonemi.AYLIK, s);
    }

    @Test
    void gercekTestUrunuPlanAtamaz() {
        servis.bildirimIsle("wh-gercek-2", "order.created", gercekSiparis("52666025", "1.00"));

        ShopierSiparisi s = kaydedilenSiparis();
        assertThat(s.getDurum()).isEqualTo(SiparisDurumu.URUN_TANIMSIZ);
        assertThat(s.getUrunId()).isEqualTo("52666025");
        verifyNoInteractions(abonelikService);
    }

    @Test
    void ayniWebhookIkinciKezIslenmez() {
        when(bildirimRepository.existsByWebhookId("wh-1")).thenReturn(true);

        servis.bildirimIsle("wh-1", "order.created", siparis("S1", "paid", "46065275", "99.00", "TRY", "musteri@ornek.com"));

        verify(siparisRepository, never()).save(any());
        verifyNoInteractions(abonelikService);
    }

    @Test
    void ayniSiparisFarkliWebhookIleIkinciKezIslenmez() {
        when(siparisRepository.findByShopierSiparisId("S1")).thenReturn(Optional.of(new ShopierSiparisi()));

        servis.bildirimIsle("wh-2", "order.created", siparis("S1", "paid", "46065275", "99.00", "TRY", "musteri@ornek.com"));

        verify(siparisRepository, never()).save(any());
        verifyNoInteractions(abonelikService);
    }

    @Test
    void dusukTutarPlanAtamaz() {
        servis.bildirimIsle("wh-3", "order.created", siparis("S3", "paid", "46065493", "199.00", "TRY", "musteri@ornek.com"));

        assertThat(kaydedilenSiparis().getDurum()).isEqualTo(SiparisDurumu.TUTAR_UYUSMUYOR);
        verifyNoInteractions(abonelikService);
    }

    @Test
    void farkliParaBirimiPlanAtamaz() {
        servis.bildirimIsle("wh-4", "order.created", siparis("S4", "paid", "46065275", "99.00", "USD", "musteri@ornek.com"));

        assertThat(kaydedilenSiparis().getDurum()).isEqualTo(SiparisDurumu.TUTAR_UYUSMUYOR);
        verifyNoInteractions(abonelikService);
    }

    @Test
    void tanimsizUrunKaydedilirAmaPlanAtanmaz() {
        servis.bildirimIsle("wh-5", "order.created", siparis("S5", "paid", "11111", "99.00", "TRY", "musteri@ornek.com"));

        ShopierSiparisi s = kaydedilenSiparis();
        assertThat(s.getDurum()).isEqualTo(SiparisDurumu.URUN_TANIMSIZ);
        assertThat(s.getUrunId()).isEqualTo("11111");
        verifyNoInteractions(abonelikService);
    }

    @Test
    void eslesmeyenEpostaAdminIncelemesineDuser() {
        servis.bildirimIsle("wh-6", "order.created", siparis("S6", "paid", "46065275", "99.00", "TRY", "baska@ornek.com"));

        assertThat(kaydedilenSiparis().getDurum()).isEqualTo(SiparisDurumu.KULLANICI_BULUNAMADI);
        verifyNoInteractions(abonelikService);
    }

    @Test
    void odenmemisSiparisPlanAtamaz() {
        servis.bildirimIsle("wh-7", "order.created", siparis("S7", "unpaid", "46065275", "99.00", "TRY", "musteri@ornek.com"));

        assertThat(kaydedilenSiparis().getDurum()).isEqualTo(SiparisDurumu.ODENMEDI);
        verifyNoInteractions(abonelikService);
    }

    @Test
    void bozukJsonHataFirlatmaz() {
        servis.bildirimIsle("wh-8", "order.created", "{bozuk".getBytes(StandardCharsets.UTF_8));

        verify(bildirimRepository).save(any());
        verify(siparisRepository, never()).save(any());
    }

    @Test
    void tamIadeAboneligiIptalEder() {
        ShopierSiparisi kayit = ShopierSiparisi.builder().id(1L).shopierSiparisId("S1").durum(SiparisDurumu.ISLENDI).build();
        when(siparisRepository.findByShopierSiparisId("S1")).thenReturn(Optional.of(kayit));

        servis.bildirimIsle("wh-9", "refund.updated",
                "{\"orderId\":\"S1\",\"status\":\"succeeded\",\"type\":\"full\"}".getBytes(StandardCharsets.UTF_8));

        assertThat(kayit.getDurum()).isEqualTo(SiparisDurumu.IADE_EDILDI);
        verify(abonelikService).siparisAbonelikleriniIptalEt(kayit);
    }

    @Test
    void kismiIadePlaniDegistirmez() {
        ShopierSiparisi kayit = ShopierSiparisi.builder().id(1L).shopierSiparisId("S1").durum(SiparisDurumu.ISLENDI).build();
        when(siparisRepository.findByShopierSiparisId("S1")).thenReturn(Optional.of(kayit));

        servis.bildirimIsle("wh-10", "refund.updated",
                "{\"orderId\":\"S1\",\"status\":\"succeeded\",\"type\":\"partial\"}".getBytes(StandardCharsets.UTF_8));

        assertThat(kayit.getDurum()).isEqualTo(SiparisDurumu.KISMI_IADE);
        verifyNoInteractions(abonelikService);
    }

    @Test
    void adminYalnizcaEslesmeyenSiparisiAtayabilir() {
        ShopierSiparisi islenmis = ShopierSiparisi.builder().id(2L).durum(SiparisDurumu.ISLENDI)
                .plan(PlanTuru.PREMIUM).donem(AbonelikDonemi.AYLIK).build();
        when(siparisRepository.findById(2L)).thenReturn(Optional.of(islenmis));

        assertThatThrownBy(() -> servis.siparisiKullaniciyaAta(2L, 5L)).isInstanceOf(IllegalArgumentException.class);

        ShopierSiparisi bekleyen = ShopierSiparisi.builder().id(3L).durum(SiparisDurumu.KULLANICI_BULUNAMADI)
                .plan(PlanTuru.PREMIUM).donem(AbonelikDonemi.AYLIK).build();
        when(siparisRepository.findById(3L)).thenReturn(Optional.of(bekleyen));
        when(kullaniciRepository.findById(5L)).thenReturn(Optional.of(kullanici));

        assertThat(servis.siparisiKullaniciyaAta(3L, 5L).durum()).isEqualTo(SiparisDurumu.ISLENDI);
        verify(abonelikService).shopierAboneligiBaslat(kullanici, PlanTuru.PREMIUM, AbonelikDonemi.AYLIK, bekleyen);
    }
}
