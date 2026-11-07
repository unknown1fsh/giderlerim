package com.scinar.giderlerim.util;

import com.opencsv.CSVParserBuilder;
import com.opencsv.CSVReader;
import com.opencsv.CSVReaderBuilder;
import com.opencsv.exceptions.CsvException;
import com.scinar.giderlerim.entity.enums.OdemeYontemi;
import com.scinar.giderlerim.exception.GecersizDosyaException;

import java.io.IOException;
import java.io.StringReader;
import java.math.BigDecimal;
import java.nio.ByteBuffer;
import java.nio.charset.CharacterCodingException;
import java.nio.charset.Charset;
import java.nio.charset.CodingErrorAction;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

/**
 * CSV/XLSX banka ekstresi ve harcama tablolarını gidere çevirmek için ortak, durumsuz ayrıştırıcı.
 * <ul>
 *   <li>Kodlama: UTF-8 (BOM'lu/BOM'suz), geçersizse Windows-1254 (Türkçe Excel).</li>
 *   <li>Ayırıcı: ilk satıra göre {@code ,} {@code ;} veya sekme.</li>
 *   <li>Tutar: {@code 1.234,56}, {@code 1,234.56}, {@code -150,00}, {@code 150,00-}, {@code (150,00)}, {@code ₺/TL}.</li>
 *   <li>İşaret: Borç/Alacak sütunu varsa yalnızca borç gider sayılır; yoksa dosyadaki çoğunluk işareti gider,
 *       azınlıktaki satırlar (gelir, iade, kart ödemesi) atlanır.</li>
 * </ul>
 */
public final class IceAktarmaAyristirici {

    private static final Locale TR = Locale.forLanguageTag("tr-TR");
    private static final Charset WINDOWS_1254 = Charset.forName("windows-1254");

    private static final List<String> TARIH_BASLIKLARI = List.of("tarih", "islemtarihi", "date", "transactiondate", "valor", "valortarihi");
    private static final List<String> TUTAR_BASLIKLARI = List.of("tutar", "islemtutari", "miktar", "amount", "tutartl", "tutartry");
    private static final List<String> BORC_BASLIKLARI = List.of("borc", "borctutari", "debit", "cikis", "harcama");
    private static final List<String> ALACAK_BASLIKLARI = List.of("alacak", "alacaktutari", "credit", "giris");
    private static final List<String> ACIKLAMA_BASLIKLARI = List.of("aciklama", "islemaciklamasi", "description", "islem", "detay", "isyeri", "merchant");
    private static final List<String> ODEME_BASLIKLARI = List.of("odemeyontemi", "paymentmethod", "odeme");

    private static final List<DateTimeFormatter> TARIH_FORMATLARI = List.of(
            DateTimeFormatter.ofPattern("d.M.yyyy"),
            DateTimeFormatter.ofPattern("d/M/yyyy"),
            DateTimeFormatter.ofPattern("d-M-yyyy"),
            DateTimeFormatter.ofPattern("yyyy-M-d"),
            DateTimeFormatter.ofPattern("yyyy.M.d"),
            DateTimeFormatter.ofPattern("yyyy/M/d"),
            DateTimeFormatter.ofPattern("d.M.yy"),
            DateTimeFormatter.ofPattern("d/M/yy"));

    private static final int MAX_ACIKLAMA = 500;

    private IceAktarmaAyristirici() {}

    /** Ham tablo: başlık satırı ve veri satırları (hücreler metin). */
    public record HamTablo(List<String> baslik, List<List<String>> satirlar) {}

    /** Gidere dönüştürülmeye hazır satır; tutar daima pozitiftir. */
    public record Satir(int satirNo, LocalDate tarih, BigDecimal tutar, String aciklama, OdemeYontemi odemeYontemi) {}

    /**
     * @param giderler      gider olarak kaydedilecek satırlar
     * @param hatalar       okunamayan satırlar için kullanıcıya gösterilecek açıklamalar
     * @param atlananSayisi gider olmadığı için atlanan satırlar (gelir, iade, kart ödemesi, sıfır tutar)
     * @param toplamSatir   başlık hariç veri satırı sayısı
     */
    public record Sonuc(List<Satir> giderler, List<String> hatalar, int atlananSayisi, int toplamSatir) {}

    // ========== Dosya okuma ==========

    public static HamTablo csvOku(byte[] icerik) {
        String metin = metneCevir(icerik);
        char ayirici = ayiriciBul(metin);
        try (CSVReader okuyucu = new CSVReaderBuilder(new StringReader(metin))
                .withCSVParser(new CSVParserBuilder().withSeparator(ayirici).build())
                .build()) {
            List<String[]> satirlar = okuyucu.readAll();
            List<List<String>> dolu = new ArrayList<>();
            for (String[] satir : satirlar) {
                if (Arrays.stream(satir).anyMatch(h -> h != null && !h.isBlank())) {
                    dolu.add(Arrays.asList(satir));
                }
            }
            if (dolu.isEmpty()) {
                throw new GecersizDosyaException("CSV dosyası boş.");
            }
            return new HamTablo(dolu.get(0), dolu.subList(1, dolu.size()));
        } catch (IOException | CsvException e) {
            throw new GecersizDosyaException("CSV dosyası okunamadı: dosya biçimini kontrol edin.");
        }
    }

    static String metneCevir(byte[] icerik) {
        if (icerik.length >= 3 && (icerik[0] & 0xFF) == 0xEF && (icerik[1] & 0xFF) == 0xBB && (icerik[2] & 0xFF) == 0xBF) {
            return new String(icerik, 3, icerik.length - 3, StandardCharsets.UTF_8);
        }
        try {
            return StandardCharsets.UTF_8.newDecoder()
                    .onMalformedInput(CodingErrorAction.REPORT)
                    .onUnmappableCharacter(CodingErrorAction.REPORT)
                    .decode(ByteBuffer.wrap(icerik))
                    .toString();
        } catch (CharacterCodingException e) {
            // Türkçe Windows/Excel çıktıları çoğunlukla Windows-1254 kodludur.
            return new String(icerik, WINDOWS_1254);
        }
    }

    static char ayiriciBul(String metin) {
        String ilkSatir = metin.lines().filter(s -> !s.isBlank()).findFirst().orElse("");
        int virgul = 0, noktaliVirgul = 0, sekme = 0;
        boolean tirnakIcinde = false;
        for (char c : ilkSatir.toCharArray()) {
            if (c == '"') tirnakIcinde = !tirnakIcinde;
            if (tirnakIcinde) continue;
            if (c == ',') virgul++;
            else if (c == ';') noktaliVirgul++;
            else if (c == '\t') sekme++;
        }
        if (noktaliVirgul > virgul && noktaliVirgul >= sekme) return ';';
        if (sekme > virgul && sekme > noktaliVirgul) return '\t';
        return ',';
    }

    // ========== Tabloyu gidere çevirme ==========

    public static Sonuc ayristir(HamTablo tablo) {
        List<String> baslik = tablo.baslik().stream().map(IceAktarmaAyristirici::baslikNormalles).toList();
        int tarihI = sutunBul(baslik, TARIH_BASLIKLARI);
        int tutarI = sutunBul(baslik, TUTAR_BASLIKLARI);
        int borcI = sutunBul(baslik, BORC_BASLIKLARI);
        int alacakI = sutunBul(baslik, ALACAK_BASLIKLARI);
        int aciklamaI = sutunBul(baslik, ACIKLAMA_BASLIKLARI);
        int odemeI = sutunBul(baslik, ODEME_BASLIKLARI);

        if (tarihI < 0 || (tutarI < 0 && borcI < 0)) {
            throw new GecersizDosyaException(
                    "Dosyada gerekli sütunlar bulunamadı. Gerekli: tarih ve tutar (veya borç). "
                            + "İsteğe bağlı: açıklama, ödeme yöntemi, alacak.");
        }

        List<String> hatalar = new ArrayList<>();
        List<Aday> adaylar = new ArrayList<>();
        int atlanan = 0;

        for (int i = 0; i < tablo.satirlar().size(); i++) {
            List<String> satir = tablo.satirlar().get(i);
            int satirNo = i + 2; // kullanıcı için: başlık 1. satır
            LocalDate tarih;
            try {
                tarih = tarihCoz(hucre(satir, tarihI));
            } catch (IllegalArgumentException e) {
                hatalar.add("Satır " + satirNo + ": " + e.getMessage());
                continue;
            }

            BigDecimal tutar;
            if (borcI >= 0) {
                BigDecimal borc = tutarCoz(hucre(satir, borcI));
                if (borc == null || borc.signum() == 0) {
                    // Borç boşsa satır alacak (gelir) satırıdır; hiçbiri doluysa okunamadı.
                    boolean alacakVar = alacakI >= 0 && tutarCoz(hucre(satir, alacakI)) != null;
                    if (alacakVar || borc != null) {
                        atlanan++;
                    } else {
                        hatalar.add("Satır " + satirNo + ": tutar okunamadı");
                    }
                    continue;
                }
                tutar = borc.abs();
            } else {
                tutar = tutarCoz(hucre(satir, tutarI));
                if (tutar == null) {
                    hatalar.add("Satır " + satirNo + ": tutar okunamadı (" + kisalt(hucre(satir, tutarI), 30) + ")");
                    continue;
                }
                if (tutar.signum() == 0) {
                    atlanan++;
                    continue;
                }
            }

            String aciklama = aciklamaI >= 0 ? hucre(satir, aciklamaI).trim() : "";
            OdemeYontemi odeme = odemeI >= 0 ? odemeYontemiCoz(hucre(satir, odemeI)) : OdemeYontemi.NAKIT;
            adaylar.add(new Aday(satirNo, tarih, tutar, aciklama.isEmpty() ? null : kisalt(aciklama, MAX_ACIKLAMA), odeme));
        }

        // Tek tutar sütununda çoğunluk işaret gider kabul edilir; azınlık (gelir/iade/ödeme) atlanır.
        int giderIsareti = borcI >= 0 ? 1 : giderIsaretiBul(adaylar);
        List<Satir> giderler = new ArrayList<>();
        for (Aday a : adaylar) {
            if (a.tutar.signum() == giderIsareti) {
                giderler.add(new Satir(a.satirNo, a.tarih, a.tutar.abs(), a.aciklama, a.odeme));
            } else {
                atlanan++;
            }
        }
        return new Sonuc(giderler, hatalar, atlanan, tablo.satirlar().size());
    }

    private record Aday(int satirNo, LocalDate tarih, BigDecimal tutar, String aciklama, OdemeYontemi odeme) {}

    private static int giderIsaretiBul(List<Aday> adaylar) {
        long eksi = adaylar.stream().filter(a -> a.tutar.signum() < 0).count();
        long arti = adaylar.size() - eksi;
        // Eşitlikte banka ekstresi varsayılır (giderler eksi).
        return eksi >= arti && eksi > 0 ? -1 : 1;
    }

    // ========== Hücre çözümleme ==========

    /** İşaretli tutarı çözer; okunamazsa {@code null}. */
    public static BigDecimal tutarCoz(String ham) {
        if (ham == null) return null;
        String s = ham.trim();
        if (s.isEmpty()) return null;

        boolean negatif = false;
        if (s.startsWith("(") && s.endsWith(")")) {
            negatif = true;
            s = s.substring(1, s.length() - 1).trim();
        }
        if (s.endsWith("-") || s.endsWith("−")) {
            negatif = true;
            s = s.substring(0, s.length() - 1).trim();
        }
        // Para birimi ve boşlukları at (TL, TRY, ₺, $, €, harfler, + işareti).
        s = s.replaceAll("[^0-9.,\\-−]", "");
        if (s.startsWith("-") || s.startsWith("−")) {
            negatif = true;
            s = s.substring(1);
        }
        if (s.isEmpty() || !s.matches("[0-9.,]+") || !s.matches(".*\\d.*")) return null;

        String sayi = ondalikNormalles(s);
        if (sayi == null) return null;
        try {
            BigDecimal tutar = new BigDecimal(sayi);
            return negatif ? tutar.negate() : tutar;
        } catch (NumberFormatException e) {
            return null;
        }
    }

    /** {@code 1.234,56}, {@code 1,234.56}, {@code 1234,5}, {@code 1.500} gibi biçimleri {@code 1234.56} biçimine çevirir. */
    static String ondalikNormalles(String s) {
        int sonNokta = s.lastIndexOf('.');
        int sonVirgul = s.lastIndexOf(',');
        if (sonNokta >= 0 && sonVirgul >= 0) {
            char ondalik = sonNokta > sonVirgul ? '.' : ',';
            char binlik = ondalik == '.' ? ',' : '.';
            String temiz = s.replace(String.valueOf(binlik), "");
            if (temiz.indexOf(ondalik) != temiz.lastIndexOf(ondalik)) return null;
            return temiz.replace(ondalik, '.');
        }
        char ayirici = sonNokta >= 0 ? '.' : (sonVirgul >= 0 ? ',' : 0);
        if (ayirici == 0) return s;
        int adet = (int) s.chars().filter(c -> c == ayirici).count();
        int sondanSonraHane = s.length() - s.lastIndexOf(ayirici) - 1;
        boolean binlikAyirici = adet > 1 || sondanSonraHane == 3;
        if (binlikAyirici) {
            // 1.234.567 veya 1.500 (TR binlik) → ayırıcıları kaldır; grup uzunlukları 3 olmalı.
            String[] gruplar = s.split(java.util.regex.Pattern.quote(String.valueOf(ayirici)));
            for (int i = 1; i < gruplar.length; i++) {
                if (gruplar[i].length() != 3) return null;
            }
            return s.replace(String.valueOf(ayirici), "");
        }
        return s.replace(ayirici, '.');
    }

    public static LocalDate tarihCoz(String ham) {
        if (ham == null || ham.isBlank()) {
            throw new IllegalArgumentException("tarih boş");
        }
        // Saat kısmını at: "07.11.2026 14:32", "2026-11-07T14:32:00"
        String s = ham.trim().split("[ T]")[0];
        for (DateTimeFormatter format : TARIH_FORMATLARI) {
            try {
                return LocalDate.parse(s, format);
            } catch (DateTimeParseException ignored) {
                // sonraki biçim
            }
        }
        throw new IllegalArgumentException("tarih biçimi tanınamadı (" + kisalt(ham, 20) + ")");
    }

    public static OdemeYontemi odemeYontemiCoz(String deger) {
        if (deger == null || deger.isBlank()) return OdemeYontemi.NAKIT;
        String n = baslikNormalles(deger);
        if (n.contains("kredi") || n.contains("credit")) return OdemeYontemi.KREDI_KARTI;
        if (n.contains("banka") || n.contains("debit")) return OdemeYontemi.BANKA_KARTI;
        if (n.contains("havale") || n.contains("eft") || n.contains("transfer") || n.contains("fast")) return OdemeYontemi.HAVALE;
        try {
            return OdemeYontemi.valueOf(deger.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            return OdemeYontemi.NAKIT;
        }
    }

    // ========== Yardımcılar ==========

    /** Türkçe harfleri sadeleştirir, küçük harfe çevirir, harf/rakam dışını atar: "İşlem Tarihi" → "islemtarihi". */
    public static String baslikNormalles(String s) {
        if (s == null) return "";
        String k = s.replace("﻿", "").toLowerCase(TR)
                .replace('ı', 'i').replace('ğ', 'g').replace('ü', 'u')
                .replace('ş', 's').replace('ö', 'o').replace('ç', 'c').replace('â', 'a').replace('î', 'i');
        return k.replaceAll("[^a-z0-9]", "");
    }

    private static int sutunBul(List<String> baslik, List<String> adaylar) {
        for (String aday : adaylar) {
            int i = baslik.indexOf(aday);
            if (i >= 0) return i;
        }
        return -1;
    }

    private static String hucre(List<String> satir, int i) {
        return i >= 0 && i < satir.size() && satir.get(i) != null ? satir.get(i) : "";
    }

    private static String kisalt(String s, int max) {
        return s.length() <= max ? s : s.substring(0, max);
    }
}
