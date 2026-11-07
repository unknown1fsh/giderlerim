package com.scinar.giderlerim.util;

import com.scinar.giderlerim.entity.enums.OdemeYontemi;
import com.scinar.giderlerim.exception.GecersizDosyaException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.math.BigDecimal;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class IceAktarmaAyristiriciTest {

    private static IceAktarmaAyristirici.Sonuc csv(byte[] icerik) {
        return IceAktarmaAyristirici.ayristir(IceAktarmaAyristirici.csvOku(icerik));
    }

    private static List<BigDecimal> tutarlar(IceAktarmaAyristirici.Sonuc sonuc) {
        return sonuc.giderler().stream().map(IceAktarmaAyristirici.Satir::tutar).toList();
    }

    @ParameterizedTest(name = "{0} -> {1}")
    @CsvSource(delimiter = '|', value = {
            "1.234,56|1234.56",
            "1,234.56|1234.56",
            "-150,00|-150.00",
            "150,00-|-150.00",
            "(150,00)|-150.00",
            "₺1.500|1500",
            "1.500 TL|1500",
            "1.500,00 TRY|1500.00",
            "1,5|1.5",
            "99.90|99.90",
            "12.345.678,90|12345678.90",
            "12,345,678.90|12345678.90",
            "+250,00|250.00",
            "−75,50|-75.50"
    })
    void tutarBicimleriCozulur(String ham, String beklenen) {
        assertThat(IceAktarmaAyristirici.tutarCoz(ham)).isEqualByComparingTo(beklenen);
    }

    @ParameterizedTest
    @CsvSource(delimiter = '|', value = {"abc", "1.2.3", "''", "TL", "1,23,4"})
    void gecersizTutarNullDoner(String ham) {
        assertThat(IceAktarmaAyristirici.tutarCoz(ham)).isNull();
    }

    @Test
    void tarihBicimleriVeSaatKismiCozulur() {
        LocalDate beklenen = LocalDate.of(2026, 11, 7);
        assertThat(IceAktarmaAyristirici.tarihCoz("07.11.2026")).isEqualTo(beklenen);
        assertThat(IceAktarmaAyristirici.tarihCoz("7.11.2026 14:32")).isEqualTo(beklenen);
        assertThat(IceAktarmaAyristirici.tarihCoz("07/11/2026")).isEqualTo(beklenen);
        assertThat(IceAktarmaAyristirici.tarihCoz("2026-11-07T10:00:00")).isEqualTo(beklenen);
        assertThat(IceAktarmaAyristirici.tarihCoz("07.11.26")).isEqualTo(beklenen);
        assertThatThrownBy(() -> IceAktarmaAyristirici.tarihCoz("dün")).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void bankaEkstresiNoktaliVirgulWindows1254GelirleriAtlar() {
        // Türk bankası dışa aktarımı: ; ayırıcı, Windows-1254, TR sayı biçimi, giderler eksi, maaş artı.
        String metin = """
                Tarih;Açıklama;Tutar;Bakiye
                01.11.2026;MAAŞ ÖDEMESİ;45.000,00;52.000,00
                02.11.2026;MİGROS ŞİŞLİ;-1.234,56;50.765,44
                03.11.2026;KİRA HAVALE;-15.000,00;35.765,44
                05.11.2026;İADE - ÇİÇEKSEPETİ;250,00;36.015,44
                06.11.2026;ELEKTRİK FATURASI;-875,40;35.140,04
                """;
        IceAktarmaAyristirici.Sonuc sonuc = csv(metin.getBytes(Charset.forName("windows-1254")));

        assertThat(tutarlar(sonuc)).usingElementComparator(BigDecimal::compareTo)
                .containsExactly(new BigDecimal("1234.56"), new BigDecimal("15000.00"), new BigDecimal("875.40"));
        assertThat(sonuc.giderler().get(0).aciklama()).isEqualTo("MİGROS ŞİŞLİ");
        assertThat(sonuc.giderler().get(0).tarih()).isEqualTo(LocalDate.of(2026, 11, 2));
        assertThat(sonuc.atlananSayisi()).isEqualTo(2); // maaş + iade
        assertThat(sonuc.hatalar()).isEmpty();
        assertThat(sonuc.toplamSatir()).isEqualTo(5);
    }

    @Test
    void krediKartiEkstresiBomluUtf8KartOdemesiniAtlar() {
        // Kart ekstresi: harcamalar artı, kart ödemesi ve iade eksi; Excel'in UTF-8 BOM'u başlıkta.
        String metin = "﻿İşlem Tarihi,Açıklama,Tutar\n"
                + "03.11.2026,TRENDYOL,\"1.299,90 TL\"\n"
                + "04.11.2026,SHELL,\"2.150,00 TL\"\n"
                + "05.11.2026,KART ÖDEMESİ,\"-10.000,00 TL\"\n"
                + "06.11.2026,NETFLIX,\"229,99 TL\"\n";
        IceAktarmaAyristirici.Sonuc sonuc = csv(metin.getBytes(StandardCharsets.UTF_8));

        assertThat(tutarlar(sonuc)).usingElementComparator(BigDecimal::compareTo)
                .containsExactly(new BigDecimal("1299.90"), new BigDecimal("2150.00"), new BigDecimal("229.99"));
        assertThat(sonuc.atlananSayisi()).isEqualTo(1);
    }

    @Test
    void borcAlacakSutunlarindaYalnizcaBorcGiderSayilir() {
        String metin = """
                TARİH;AÇIKLAMA;BORÇ;ALACAK
                01.11.2026;MAAŞ;;45.000,00
                02.11.2026;A101;312,75;
                03.11.2026;ECZANE;98,50;
                """;
        IceAktarmaAyristirici.Sonuc sonuc = csv(metin.getBytes(StandardCharsets.UTF_8));

        assertThat(tutarlar(sonuc)).usingElementComparator(BigDecimal::compareTo)
                .containsExactly(new BigDecimal("312.75"), new BigDecimal("98.50"));
        assertThat(sonuc.atlananSayisi()).isEqualTo(1);
    }

    @Test
    void basitKullaniciTablosuVirgulAyiriciVeOdemeYontemi() {
        String metin = """
                tarih,tutar,aciklama,odeme_yontemi
                2026-11-01,99.90,Kitap,kredi kartı
                2026-11-02,45,Kahve,nakit
                2026-11-03,bilinmiyor,Hatalı satır,nakit
                """;
        IceAktarmaAyristirici.Sonuc sonuc = csv(metin.getBytes(StandardCharsets.UTF_8));

        assertThat(tutarlar(sonuc)).usingElementComparator(BigDecimal::compareTo)
                .containsExactly(new BigDecimal("99.90"), new BigDecimal("45"));
        assertThat(sonuc.giderler().get(0).odemeYontemi()).isEqualTo(OdemeYontemi.KREDI_KARTI);
        assertThat(sonuc.hatalar()).singleElement().asString().startsWith("Satır 4:");
    }

    @Test
    void sekmeAyiriciTaninir() {
        String metin = "Tarih\tTutar\n07.11.2026\t10,00\n";
        assertThat(tutarlar(csv(metin.getBytes(StandardCharsets.UTF_8))))
                .usingElementComparator(BigDecimal::compareTo).containsExactly(new BigDecimal("10.00"));
    }

    @Test
    void zorunluSutunYoksaAnlasilirHata() {
        byte[] icerik = "aciklama,not\nmarket,x\n".getBytes(StandardCharsets.UTF_8);
        assertThatThrownBy(() -> csv(icerik))
                .isInstanceOf(GecersizDosyaException.class)
                .hasMessageContaining("tarih ve tutar");
    }

    @Test
    void ozetGelirVeHatalariAnlatir() {
        IceAktarmaAyristirici.Sonuc sonuc = new IceAktarmaAyristirici.Sonuc(List.of(), List.of("Satır 3: tutar okunamadı"), 2, 5);
        assertThat(IceAktarmaOzeti.mesaj(sonuc))
                .contains("2 satır gider olmadığı için atlandı")
                .contains("1 satır okunamadı: Satır 3");
        assertThat(IceAktarmaOzeti.mesaj(new IceAktarmaAyristirici.Sonuc(List.of(), List.of(), 0, 1))).isNull();
    }
}
