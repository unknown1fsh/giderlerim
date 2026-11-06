package com.scinar.giderlerim.controller;

import com.scinar.giderlerim.security.JwtAuthFilter;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** SHOPIER_WEBHOOK_TOKEN tanımsızken webhook fail-closed çalışmalı. */
@WebMvcTest(controllers = ShopierWebhookController.class)
@AutoConfigureMockMvc(addFilters = false)
@TestPropertySource(properties = "shopier.webhook.token=")
class ShopierWebhookTokensizControllerTest {

    @Autowired
    MockMvc mockMvc;

    @MockBean
    JwtAuthFilter jwtAuthFilter;

    @Test
    void tokenYoksaBildirimReddedilir() throws Exception {
        mockMvc.perform(post("/api/v1/odeme/shopier/webhook")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Shopier-Signature", ShopierWebhookControllerTest.hexImza("{}"))
                        .content("{}"))
                .andExpect(status().isServiceUnavailable());
    }
}
