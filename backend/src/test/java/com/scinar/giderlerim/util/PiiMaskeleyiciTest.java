package com.scinar.giderlerim.util;

import com.scinar.giderlerim.entity.Kullanici;
import com.scinar.giderlerim.exception.AiIzniGerekliException;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class PiiMaskeleyiciTest {

    @Test
    void ibanMaskelenir() {
        assertThat(PiiMaskeleyici.maskele("Alıcı IBAN: TR33 0006 1005 1978 6457 8413 26 havale"))
                .isEqualTo("Alıcı IBAN: [IBAN] havale");
        assertThat(PiiMaskeleyici.maskele("TR330006100519786457841326")).isEqualTo("[IBAN]");
    }

    @Test
    void gecerliKartNumarasiMaskelenirRastgeleSayiDegil() {
        assertThat(PiiMaskeleyici.maskele("Kart 4111 1111 1111 1111 ile ödendi")).isEqualTo("Kart [KART] ile ödendi");
        assertThat(PiiMaskeleyici.maskele("Kart 4111-1111-1111-1111")).isEqualTo("Kart [KART]");
        assertThat(PiiMaskeleyici.maskele("kartım 4111 1111 1111 1111, son")).isEqualTo("kartım [KART], son");
        assertThat(PiiMaskeleyici.maskele("TCKN: 10000000146.")).isEqualTo("TCKN: [TCKN].");
        // Luhn geçersiz 16 haneli referans numarası korunur.
        assertThat(PiiMaskeleyici.maskele("Ref 1234567812345678")).isEqualTo("Ref 1234567812345678");
    }

    @Test
    void tcknTelefonVeEpostaMaskelenir() {
        assertThat(PiiMaskeleyici.maskele("TCKN 10000000146")).isEqualTo("TCKN [TCKN]");
        assertThat(PiiMaskeleyici.maskele("Tel: +90 553 140 56 62")).isEqualTo("Tel: [TELEFON]");
        assertThat(PiiMaskeleyici.maskele("Tel: 0553 140 56 62")).isEqualTo("Tel: [TELEFON]");
        assertThat(PiiMaskeleyici.maskele("Tel: 5531405662")).isEqualTo("Tel: [TELEFON]");
        assertThat(PiiMaskeleyici.maskele("iletişim: Ayse.Yilmaz+fatura@örnek.com.tr")).isEqualTo("iletişim: [E-POSTA]");
    }

    @Test
    void tutarTarihVeKisaSayilarKorunur() {
        String metin = "07.11.2026 MIGROS 1.234,56 TL; 2 adet; 99,00 TL; sipariş 516182454";
        assertThat(PiiMaskeleyici.maskele(metin)).isEqualTo(metin);
    }

    @Test
    void kisiAdlariTurkceHarflerleBuyukKucukDuyarsizMaskelenir() {
        String metin = "SELİM SERCAN ÇINAR adına; selim sercan çınar; Selimiye Camii";
        assertThat(PiiMaskeleyici.maskele(metin, "Selim Sercan", "Çınar"))
                .isEqualTo("[AD] [AD] [AD] adına; [AD] [AD] [AD]; Selimiye Camii");
    }

    @Test
    void kisaAdParcalariSiradanKelimeleriBozmaz() {
        assertThat(PiiMaskeleyici.maskele("Al ve su aldım", "Al", "Su")).isEqualTo("Al ve su aldım");
    }

    @Test
    void nullVeBosGuvenli() {
        assertThat(PiiMaskeleyici.maskele(null)).isNull();
        assertThat(PiiMaskeleyici.maskele("")).isEmpty();
        assertThat(PiiMaskeleyici.maskele("market", (String[]) null)).isEqualTo("market");
        assertThat(PiiMaskeleyici.maskele("market", null, " ")).isEqualTo("market");
    }

    @Test
    void maskeleVeKisaltUzunlukSiniriniUygular() {
        assertThat(PiiMaskeleyici.maskeleVeKisalt("a".repeat(100), 10)).hasSize(10).endsWith("…");
        assertThat(PiiMaskeleyici.maskeleVeKisalt("kısa", 10)).isEqualTo("kısa");
    }

    @Test
    void aiIzinKapisiIzinsizKullaniciyiReddeder() {
        assertThatThrownBy(() -> AiIzinKapisi.dogrula(Kullanici.builder().build()))
                .isInstanceOf(AiIzniGerekliException.class);
        assertThatThrownBy(() -> AiIzinKapisi.dogrula(null)).isInstanceOf(AiIzniGerekliException.class);
        assertThatCode(() -> AiIzinKapisi.dogrula(Kullanici.builder().aiIzni(true).build())).doesNotThrowAnyException();
    }
}
