package com.scinar.giderlerim;

import com.scinar.giderlerim.entity.Abonelik;
import com.scinar.giderlerim.entity.Kullanici;
import com.scinar.giderlerim.entity.enums.AbonelikDurumu;
import com.scinar.giderlerim.entity.enums.PlanTuru;
import com.scinar.giderlerim.entity.enums.SiparisDurumu;
import com.scinar.giderlerim.repository.AbonelikRepository;
import com.scinar.giderlerim.repository.KullaniciRepository;
import com.scinar.giderlerim.repository.ShopierSiparisiRepository;
import com.scinar.giderlerim.service.AbonelikService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Gerçek PostgreSQL üzerinde imzalı Shopier webhook → sipariş → abonelik → plan akışı.
 * {@code MIGRASYON_TEST_DB_URL} tanımlıysa (CI) çalışır.
 */
@EnabledIfEnvironmentVariable(named = "MIGRASYON_TEST_DB_URL", matches = ".+")
@SpringBootTest(properties = {
        "spring.datasource.url=${MIGRASYON_TEST_DB_URL}",
        "spring.datasource.username=${MIGRASYON_TEST_DB_USER:postgres}",
        "spring.datasource.password=${MIGRASYON_TEST_DB_PASSWORD:postgres}",
        "jwt.secret=entegrasyon-testi-icin-en-az-otuz-iki-baytlik-gizli-anahtar",
        "app.mail.enabled=false",
        "shopier.webhook.token=" + ShopierOdemeAkisiEntegrasyonTest.TOKEN
})
@AutoConfigureMockMvc
class ShopierOdemeAkisiEntegrasyonTest {

    static final String TOKEN = "entegrasyon-webhook-token";

    @Autowired MockMvc mockMvc;
    @Autowired KullaniciRepository kullaniciRepository;
    @Autowired ShopierSiparisiRepository siparisRepository;
    @Autowired AbonelikRepository abonelikRepository;
    @Autowired AbonelikService abonelikService;

    private Kullanici kullaniciOlustur() {
        return kullaniciRepository.save(Kullanici.builder()
                .ad("Test").soyad("Kullanıcı")
                .email("odeme-" + UUID.randomUUID() + "@ornek.com")
                .sifreHash("$2a$10$abcdefghijklmnopqrstuuVrKXhwIMx3lEl2sJ6kNrjnQ3IM8w6HW")
                .build());
    }

    private void webhookGonder(String olay, String govde) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(TOKEN.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        String imza = HexFormat.of().formatHex(mac.doFinal(govde.getBytes(StandardCharsets.UTF_8)));
        mockMvc.perform(post("/api/v1/odeme/shopier/webhook")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Shopier-Signature", imza)
                        .header("Shopier-Event", olay)
                        .header("Shopier-Webhook-Id", UUID.randomUUID().toString())
                        .content(govde))
                .andExpect(status().isOk());
    }

    private static String siparisGovdesi(String siparisId, String email) {
        return """
                {"id":"%s","paymentStatus":"paid","currency":"TRY","totals":{"total":"99.00"},
                 "billingInfo":{"email":"%s"},"lineItems":[{"productId":"46065275","quantity":1}]}
                """.formatted(siparisId, email.toUpperCase());
    }

    @Test
    void odemePlaniAcarIadePlaniKapatir() throws Exception {
        Kullanici kullanici = kullaniciOlustur();
        String siparisId = "S-" + UUID.randomUUID();

        webhookGonder("order.created", siparisGovdesi(siparisId, kullanici.getEmail()));
        webhookGonder("order.created", siparisGovdesi(siparisId, kullanici.getEmail())); // tekrar: yok sayılır

        assertThat(kullaniciRepository.findById(kullanici.getId()).orElseThrow().getPlan()).isEqualTo(PlanTuru.PREMIUM);
        assertThat(siparisRepository.findByShopierSiparisId(siparisId).orElseThrow().getDurum()).isEqualTo(SiparisDurumu.ISLENDI);
        assertThat(abonelikRepository.findByKullaniciIdAndDurum(kullanici.getId(), AbonelikDurumu.AKTIF)).hasSize(1);

        webhookGonder("refund.updated", "{\"orderId\":\"" + siparisId + "\",\"status\":\"succeeded\",\"type\":\"full\"}");

        assertThat(kullaniciRepository.findById(kullanici.getId()).orElseThrow().getPlan()).isEqualTo(PlanTuru.FREE);
        assertThat(siparisRepository.findByShopierSiparisId(siparisId).orElseThrow().getDurum()).isEqualTo(SiparisDurumu.IADE_EDILDI);
    }

    @Test
    void suresiDolanAbonelikPlaniDusurur() throws Exception {
        Kullanici kullanici = kullaniciOlustur();
        webhookGonder("order.created", siparisGovdesi("S-" + UUID.randomUUID(), kullanici.getEmail()));

        Abonelik abonelik = abonelikRepository.findByKullaniciIdAndDurum(kullanici.getId(), AbonelikDurumu.AKTIF).get(0);
        abonelik.setBaslangic(LocalDateTime.now().minusMonths(2));
        abonelik.setBitis(LocalDateTime.now().minusDays(1));
        abonelikRepository.saveAndFlush(abonelik);

        assertThat(abonelikService.suresiDolanlariIsle()).isGreaterThanOrEqualTo(1);
        assertThat(kullaniciRepository.findById(kullanici.getId()).orElseThrow().getPlan()).isEqualTo(PlanTuru.FREE);
        assertThat(abonelikRepository.findById(abonelik.getId()).orElseThrow().getDurum()).isEqualTo(AbonelikDurumu.SURESI_DOLDU);
    }

    @Test
    void imzasizBildirimReddedilir() throws Exception {
        mockMvc.perform(post("/api/v1/odeme/shopier/webhook")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized());
    }
}
