package com.scinar.giderlerim.util;

import org.junit.jupiter.api.Test;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HexFormat;

import static org.assertj.core.api.Assertions.assertThat;

class ShopierImzaDogrulayiciTest {

    private static final String TOKEN = "test-webhook-token";
    private static final byte[] GOVDE = "{\"orderId\":\"123\",\"total\":\"99.00\"}".getBytes(StandardCharsets.UTF_8);

    private static byte[] hmac(byte[] govde, String token) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(token.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        return mac.doFinal(govde);
    }

    @Test
    void tokenTanimliDegilseReddeder() throws Exception {
        String imza = HexFormat.of().formatHex(hmac(GOVDE, "x"));
        assertThat(ShopierImzaDogrulayici.webhookImzasiGecerli(GOVDE, imza, "")).isFalse();
        assertThat(ShopierImzaDogrulayici.webhookImzasiGecerli(GOVDE, imza, null)).isFalse();
        assertThat(ShopierImzaDogrulayici.webhookImzasiGecerli(GOVDE, imza, "   ")).isFalse();
    }

    @Test
    void imzaBasligiYoksaReddeder() {
        assertThat(ShopierImzaDogrulayici.webhookImzasiGecerli(GOVDE, null, TOKEN)).isFalse();
        assertThat(ShopierImzaDogrulayici.webhookImzasiGecerli(GOVDE, " ", TOKEN)).isFalse();
    }

    @Test
    void hexImzayiKabulEder() throws Exception {
        String imza = HexFormat.of().formatHex(hmac(GOVDE, TOKEN));
        assertThat(ShopierImzaDogrulayici.webhookImzasiGecerli(GOVDE, imza, TOKEN)).isTrue();
        assertThat(ShopierImzaDogrulayici.webhookImzasiGecerli(GOVDE, imza.toUpperCase(), TOKEN)).isTrue();
        assertThat(ShopierImzaDogrulayici.webhookImzasiGecerli(GOVDE, "sha256=" + imza, TOKEN)).isTrue();
    }

    @Test
    void paddingliBase64ImzayiKabulEder() throws Exception {
        String imza = Base64.getEncoder().encodeToString(hmac(GOVDE, TOKEN));
        assertThat(imza).endsWith("=");
        assertThat(ShopierImzaDogrulayici.webhookImzasiGecerli(GOVDE, imza, TOKEN)).isTrue();
        assertThat(ShopierImzaDogrulayici.webhookImzasiGecerli(GOVDE, "sha256=" + imza, TOKEN)).isTrue();
    }

    @Test
    void yanlisTokenVeyaDegistirilmisGovdeyiReddeder() throws Exception {
        String yanlisImza = HexFormat.of().formatHex(hmac(GOVDE, "baska-token"));
        assertThat(ShopierImzaDogrulayici.webhookImzasiGecerli(GOVDE, yanlisImza, TOKEN)).isFalse();

        String dogruImza = HexFormat.of().formatHex(hmac(GOVDE, TOKEN));
        byte[] degisik = "{\"orderId\":\"123\",\"total\":\"1.00\"}".getBytes(StandardCharsets.UTF_8);
        assertThat(ShopierImzaDogrulayici.webhookImzasiGecerli(degisik, dogruImza, TOKEN)).isFalse();
    }

    @Test
    void bozukImzaFormatiniReddeder() {
        assertThat(ShopierImzaDogrulayici.webhookImzasiGecerli(GOVDE, "sha256=", TOKEN)).isFalse();
        assertThat(ShopierImzaDogrulayici.webhookImzasiGecerli(GOVDE, "%%%gecersiz%%%", TOKEN)).isFalse();
    }

    @Test
    void parmakIziHamIcerikIcermez() {
        assertThat(ShopierImzaDogrulayici.govdeParmakIzi(GOVDE)).hasSize(12).matches("[0-9a-f]+");
        assertThat(ShopierImzaDogrulayici.govdeParmakIzi(null)).hasSize(12);
    }
}
