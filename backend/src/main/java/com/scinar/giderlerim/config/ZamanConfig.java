package com.scinar.giderlerim.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.time.Clock;
import java.time.ZoneId;

/** Uygulama saati (Europe/Istanbul) ve zamanlanmış işler. */
@Configuration
@EnableScheduling
@EnableConfigurationProperties(ShopierAyarlari.class)
public class ZamanConfig {

    public static final ZoneId UYGULAMA_SAAT_DILIMI = ZoneId.of("Europe/Istanbul");

    @Bean
    public Clock uygulamaSaati() {
        return Clock.system(UYGULAMA_SAAT_DILIMI);
    }
}
