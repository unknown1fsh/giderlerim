package com.scinar.giderlerim.controller;

import com.scinar.giderlerim.security.JwtAuthFilter;
import com.scinar.giderlerim.service.ShopierOdemeService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = ShopierWebhookController.class)
@AutoConfigureMockMvc(addFilters = false)
@TestPropertySource(properties = "shopier.webhook.token=" + ShopierWebhookControllerTest.TOKEN)
@ExtendWith(OutputCaptureExtension.class)
class ShopierWebhookControllerTest {

    static final String TOKEN = "test-webhook-token";
    private static final String GOVDE = "{\"buyer\":{\"email\":\"musteri@ornek.com\"},\"total\":\"99.00\"}";

    @Autowired
    MockMvc mockMvc;

    /** SecurityConfig bağımlılığı — slice testinde gerçek filtreyi kurmuyoruz */
    @MockBean
    JwtAuthFilter jwtAuthFilter;

    @MockBean
    ShopierOdemeService odemeService;

    static String hexImza(String govde) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(TOKEN.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        return HexFormat.of().formatHex(mac.doFinal(govde.getBytes(StandardCharsets.UTF_8)));
    }

    @Test
    void gecerliImzaKabulEdilirVeGovdeLoglanmaz(CapturedOutput cikti) throws Exception {
        mockMvc.perform(post("/api/v1/odeme/shopier/webhook")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Shopier-Signature", hexImza(GOVDE))
                        .header("Shopier-Event", "order.created")
                        .header("Shopier-Webhook-Id", "wh-1")
                        .content(GOVDE))
                .andExpect(status().isOk());

        verify(odemeService).bildirimIsle(eq("wh-1"), eq("order.created"), any());

        assertThat(cikti.getAll()).contains("Shopier webhook kabul edildi");
        assertThat(cikti.getAll()).doesNotContain("musteri@ornek.com").doesNotContain(TOKEN);
    }

    @Test
    void imzaEksikse401(CapturedOutput cikti) throws Exception {
        mockMvc.perform(post("/api/v1/odeme/shopier/webhook")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(GOVDE))
                .andExpect(status().isUnauthorized());

        verify(odemeService, never()).bildirimIsle(any(), any(), any());
        assertThat(cikti.getAll()).contains("imza geçersiz veya eksik").doesNotContain("musteri@ornek.com");
    }

    @Test
    void imzaYanlissa401() throws Exception {
        mockMvc.perform(post("/api/v1/odeme/shopier/webhook")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Shopier-Signature", "00".repeat(32))
                        .content(GOVDE))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void islemeHatasinda500DonerKiShopierYenidenDenesin() throws Exception {
        doThrow(new IllegalStateException("veritabanı yok")).when(odemeService).bildirimIsle(any(), any(), any());

        mockMvc.perform(post("/api/v1/odeme/shopier/webhook")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Shopier-Signature", hexImza(GOVDE))
                        .content(GOVDE))
                .andExpect(status().isInternalServerError());
    }
}
