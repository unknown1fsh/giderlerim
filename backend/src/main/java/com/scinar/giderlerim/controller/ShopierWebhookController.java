package com.scinar.giderlerim.controller;

import com.scinar.giderlerim.util.ShopierImzaDogrulayici;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;

/**
 * Shopier uygulama webhook / URL doğrulama uçları.
 * İmza: {@code Shopier-Signature} başlığı, HMAC-SHA256 (webhook token + ham gövde).
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/odeme/shopier")
public class ShopierWebhookController {

    @Value("${shopier.webhook.token:}")
    private String webhookToken;

    @GetMapping("/webhook")
    public ResponseEntity<String> webhookGet() {
        return ResponseEntity.ok("ok");
    }

    @PostMapping("/webhook")
    public ResponseEntity<Void> webhookPost(
            @RequestHeader(value = "Shopier-Signature", required = false) String shopierSignature,
            @RequestBody(required = false) byte[] hamGovde
    ) {
        if (!ShopierImzaDogrulayici.webhookImzasiGecerli(hamGovde, shopierSignature, webhookToken)) {
            log.warn("Shopier webhook reddedildi: imza geçersiz veya Shopier-Signature eksik (token tanımlı)");
            return ResponseEntity.status(401).build();
        }

        String metin = hamGovde != null && hamGovde.length > 0
                ? new String(hamGovde, StandardCharsets.UTF_8)
                : "";
        log.info("Shopier webhook kabul edildi: {}", metin);
        return ResponseEntity.ok().build();
    }
}
