package com.scinar.giderlerim.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;

public final class HesapTokenGuvenligi {
    private static final SecureRandom RANDOM = new SecureRandom();

    private HesapTokenGuvenligi() {}

    public static String yeniToken() {
        byte[] veri = new byte[32];
        RANDOM.nextBytes(veri);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(veri);
    }

    public static String hash(String token) {
        try {
            byte[] ozet = MessageDigest.getInstance("SHA-256")
                    .digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(ozet);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 kullanılamıyor.", ex);
        }
    }
}
