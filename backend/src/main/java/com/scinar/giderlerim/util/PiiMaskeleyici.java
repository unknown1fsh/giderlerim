package com.scinar.giderlerim.util;

import java.util.Arrays;
import java.util.Locale;
import java.util.Objects;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Yapay zeka sağlayıcısına gönderilen metinlerden kişisel verileri maskeler (KVKK veri minimizasyonu).
 * Maskelenenler: IBAN, ödeme kartı numarası (Luhn doğrulamalı), TC kimlik numarası, cep telefonu,
 * e-posta ve verilen kişi adları. Tutarlar ve tarihler korunur.
 */
public final class PiiMaskeleyici {

    private static final Locale TR = Locale.forLanguageTag("tr-TR");

    private static final Pattern IBAN = Pattern.compile("(?i)\\bTR\\s?\\d{2}(?:\\s?\\d){22}\\b");
    private static final Pattern EPOSTA = Pattern.compile("[\\p{L}\\d._%+-]+@[\\p{L}\\d-]+(?:\\.[\\p{L}\\d-]+)+");
    // Ondalık/binlik parçası olan sayılar (ör. 1.234,56) dışarıda kalır; ardından gelen noktalama ise sınır sayılır.
    private static final Pattern KART_ADAYI = Pattern.compile("(?<!\\d|\\d[.,])(?:\\d[ -]?){12,18}\\d(?!\\d|[.,]\\d)");
    private static final Pattern TCKN = Pattern.compile("(?<!\\d|\\d[.,])[1-9]\\d{10}(?!\\d|[.,]\\d)");
    private static final Pattern TELEFON = Pattern.compile(
            "(?<![\\d])(?:\\+?90[\\s-]?)?\\(?0?5\\d{2}\\)?[\\s-]?\\d{3}[\\s-]?\\d{2}[\\s-]?\\d{2}(?![\\d])");

    private PiiMaskeleyici() {}

    /**
     * @param metin       maskelenecek metin (null olabilir)
     * @param kisiAdlari  metinden çıkarılacak ad/soyad değerleri (ör. kullanıcının kendi adı)
     */
    public static String maskele(String metin, String... kisiAdlari) {
        if (metin == null || metin.isEmpty()) {
            return metin;
        }
        String sonuc = IBAN.matcher(metin).replaceAll("[IBAN]");
        sonuc = EPOSTA.matcher(sonuc).replaceAll("[E-POSTA]");
        sonuc = kartlariMaskele(sonuc);
        sonuc = TCKN.matcher(sonuc).replaceAll("[TCKN]");
        sonuc = TELEFON.matcher(sonuc).replaceAll("[TELEFON]");
        return adlariMaskele(sonuc, kisiAdlari);
    }

    /** Maskeleyip en fazla {@code maxUzunluk} karaktere kısaltır. */
    public static String maskeleVeKisalt(String metin, int maxUzunluk, String... kisiAdlari) {
        String maskeli = maskele(metin, kisiAdlari);
        if (maskeli == null || maskeli.length() <= maxUzunluk) {
            return maskeli;
        }
        return maskeli.substring(0, Math.max(0, maxUzunluk - 1)) + "…";
    }

    private static String kartlariMaskele(String metin) {
        Matcher m = KART_ADAYI.matcher(metin);
        StringBuilder sb = new StringBuilder();
        while (m.find()) {
            String rakamlar = m.group().replaceAll("[ -]", "");
            String yerine = rakamlar.length() >= 13 && rakamlar.length() <= 19 && luhnGecerli(rakamlar)
                    ? "[KART]" : m.group();
            m.appendReplacement(sb, Matcher.quoteReplacement(yerine));
        }
        m.appendTail(sb);
        return sb.toString();
    }

    static boolean luhnGecerli(String rakamlar) {
        int toplam = 0;
        boolean ikiKat = false;
        for (int i = rakamlar.length() - 1; i >= 0; i--) {
            int d = rakamlar.charAt(i) - '0';
            if (ikiKat) {
                d *= 2;
                if (d > 9) d -= 9;
            }
            toplam += d;
            ikiKat = !ikiKat;
        }
        return toplam % 10 == 0;
    }

    private static String adlariMaskele(String metin, String... kisiAdlari) {
        if (kisiAdlari == null) {
            return metin;
        }
        String sonuc = metin;
        for (String ad : Arrays.stream(kisiAdlari).filter(Objects::nonNull).map(String::trim).toList()) {
            for (String parca : ad.split("\\s+")) {
                if (parca.length() < 3) {
                    continue; // "Al", "Su" gibi kısa parçalar sıradan kelimelerle çakışır
                }
                // Türkçe büyük/küçük harf dönüşümü (İ/ı) farklı olduğu için TR yerel ayarlı biçimler de aranır.
                for (String bicim : new String[]{parca, parca.toUpperCase(TR), parca.toLowerCase(TR)}) {
                    Pattern p = Pattern.compile("(?<!\\p{L})" + Pattern.quote(bicim) + "(?!\\p{L})",
                            Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE);
                    sonuc = p.matcher(sonuc).replaceAll("[AD]");
                }
            }
        }
        return sonuc;
    }
}
