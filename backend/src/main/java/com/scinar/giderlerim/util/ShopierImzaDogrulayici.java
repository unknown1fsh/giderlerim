package com.scinar.giderlerim.util;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Locale;
import java.util.Optional;

/**
 * Shopier OAuth uygulama webhook doğrulaması.
 * @see <a href="https://developer.shopier.com/reference/webhook-configuration">Webhook configuration</a>
 */
public final class ShopierImzaDogrulayici {

    private static final String ALGORITMA = "HmacSHA256";
    private static final String SHA256_ONEKI = "sha256=";

    private ShopierImzaDogrulayici() {
    }

    /**
     * Fail-closed doğrulama: webhook token tanımlı değilse, imza başlığı yoksa veya imza eşleşmezse {@code false}.
     * İmza ham gövdenin HMAC-SHA256 özetidir; hex veya base64 kodlaması (isteğe bağlı {@code sha256=} önekiyle) kabul edilir.
     * Karşılaştırma sabit zamanlıdır.
     */
    public static boolean webhookImzasiGecerli(byte[] hamGovde, String shopierSignatureBasligi, String webhookToken) {
        if (webhookToken == null || webhookToken.isBlank()) {
            return false;
        }
        if (shopierSignatureBasligi == null || shopierSignatureBasligi.isBlank()) {
            return false;
        }

        byte[] beklenen = hmacHesapla(hamGovde != null ? hamGovde : new byte[0], webhookToken);
        return imzayiCoz(shopierSignatureBasligi)
                .map(gelen -> MessageDigest.isEqual(beklenen, gelen))
                .orElse(false);
    }

    private static byte[] hmacHesapla(byte[] govde, String webhookToken) {
        try {
            Mac mac = Mac.getInstance(ALGORITMA);
            mac.init(new SecretKeySpec(webhookToken.getBytes(StandardCharsets.UTF_8), ALGORITMA));
            return mac.doFinal(govde);
        } catch (Exception e) {
            throw new IllegalStateException("HMAC-SHA256 hesaplanamadı.", e);
        }
    }

    private static Optional<byte[]> imzayiCoz(String baslik) {
        String imza = baslik.trim();
        if (imza.toLowerCase(Locale.ROOT).startsWith(SHA256_ONEKI)) {
            imza = imza.substring(SHA256_ONEKI.length()).trim();
        }
        if (imza.isEmpty()) {
            return Optional.empty();
        }
        if (imza.length() % 2 == 0 && imza.matches("[0-9a-fA-F]+")) {
            return Optional.of(HexFormat.of().parseHex(imza));
        }
        try {
            return Optional.of(Base64.getDecoder().decode(imza));
        } catch (IllegalArgumentException e) {
            return Optional.empty();
        }
    }

    /** Log korelasyonu için gövdenin SHA-256 özetinin ilk 12 hex karakteri; ham içerik loglanmaz. */
    public static String govdeParmakIzi(byte[] hamGovde) {
        try {
            byte[] ozet = MessageDigest.getInstance("SHA-256").digest(hamGovde != null ? hamGovde : new byte[0]);
            return HexFormat.of().formatHex(ozet).substring(0, 12);
        } catch (Exception e) {
            return "bilinmiyor";
        }
    }
}
