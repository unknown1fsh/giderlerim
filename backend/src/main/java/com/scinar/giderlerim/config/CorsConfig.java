package com.scinar.giderlerim.config;

import com.scinar.giderlerim.service.SistemParametresiDegerService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class CorsConfig {

    private final SistemParametresiDegerService parametreler;

    @Value("${allowed.origin}")
    private String allowedOrigin;

    @Bean
    public CorsFilter corsFilter() {
        return new CorsFilter(corsConfigurationSource());
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        return request -> corsConfiguration();
    }

    private CorsConfiguration corsConfiguration() {
        CorsConfiguration konfigürasyon = new CorsConfiguration();
        String originler = parametreler.metin("allowed.origin", allowedOrigin);
        konfigürasyon.setAllowedOrigins(List.of(originler.split("\\s*,\\s*")));
        konfigürasyon.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        konfigürasyon.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Refresh-Token", "Accept"));
        konfigürasyon.setAllowCredentials(true);
        konfigürasyon.setMaxAge(3600L);
        return konfigürasyon;
    }
}
