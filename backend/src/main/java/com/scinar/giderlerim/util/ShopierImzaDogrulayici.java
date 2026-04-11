package com.scinar.giderlerim.util;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.HexFormat;

/**
 * Shopier OAuth uygulama webhook doğrulaması.
 * @see <a href="https://developer.shopier.com/reference/webhook-configuration">Webhook configuration</a>
 */
public final class ShopierImzaDogrulayici {

    private ShopierImzaDogrulayici() {
    }

    /**
     * Webhook token tanımlı değilse doğrulama atlanır (yerel geliştirme).
     * Token tanımlıysa {@code Shopier-Signature} başlığı zorunludur ve HMAC-SHA256 ile gövde doğrulanır.
     */
    public static boolean webhookImzasiGecerli(byte[] hamGovde, String shopierSignatureBasligi, String webhookToken) {
        if (webhookToken == null || webhookToken.isBlank()) {
            return true;
        }
        if (shopierSignatureBasligi == null || shopierSignatureBasligi.isBlank()) {
            return false;
        }

        byte[] govde = hamGovde != null ? hamGovde : new byte[0];
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(webhookToken.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] beklenen = mac.doFinal(govde);
            String imzaHam = shopierSignatureBasligi.trim();
            if (imzaHam.contains("=")) {
                imzaHam = imzaHam.substring(imzaHam.lastIndexOf('=') + 1).trim();
            }

            if (imzaHam.length() % 2 == 0 && imzaHam.matches("[0-9a-fA-F]+")) {
                byte[] gelen = HexFormat.of().parseHex(imzaHam.toLowerCase());
                return MessageDigest.isEqual(beklenen, gelen);
            }

            String beklenenHex = HexFormat.of().formatHex(beklenen);
            if (MessageDigest.isEqual(
                    beklenenHex.toLowerCase().getBytes(StandardCharsets.UTF_8),
                    imzaHam.toLowerCase().getBytes(StandardCharsets.UTF_8))) {
                return true;
            }

            byte[] gelenB64 = Base64.getDecoder().decode(imzaHam);
            return MessageDigest.isEqual(beklenen, gelenB64);
        } catch (Exception e) {
            return false;
        }
    }
}
