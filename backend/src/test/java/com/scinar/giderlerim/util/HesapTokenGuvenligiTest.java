package com.scinar.giderlerim.util;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class HesapTokenGuvenligiTest {

    @Test
    void hamTokenYeterliEntropiyeSahipVeTekrarsizdir() {
        String ilk = HesapTokenGuvenligi.yeniToken();
        String ikinci = HesapTokenGuvenligi.yeniToken();

        assertThat(ilk).hasSizeGreaterThanOrEqualTo(43).isNotEqualTo(ikinci);
    }

    @Test
    void veritabanindaYalnizcaSabitUzunluktaHashSaklanir() {
        String token = HesapTokenGuvenligi.yeniToken();
        String hash = HesapTokenGuvenligi.hash(token);

        assertThat(hash).hasSize(64).doesNotContain(token);
        assertThat(HesapTokenGuvenligi.hash(token)).isEqualTo(hash);
    }
}
