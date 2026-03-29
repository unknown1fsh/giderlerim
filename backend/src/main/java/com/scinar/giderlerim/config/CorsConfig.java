package com.scinar.giderlerim.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

@Configuration
public class CorsConfig {

    @Value("${allowed.origin}")
    private String allowedOrigin;

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration konfigürasyon = new CorsConfiguration();
        konfigürasyon.setAllowedOrigins(List.of(allowedOrigin.split(",")));
        konfigürasyon.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        konfigürasyon.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Refresh-Token", "Accept"));
        konfigürasyon.setAllowCredentials(true);
        konfigürasyon.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource kaynak = new UrlBasedCorsConfigurationSource();
        kaynak.registerCorsConfiguration("/**", konfigürasyon);

        return new CorsFilter(kaynak);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration konfigürasyon = new CorsConfiguration();
        konfigürasyon.setAllowedOrigins(List.of(allowedOrigin.split(",")));
        konfigürasyon.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        konfigürasyon.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Refresh-Token", "Accept"));
        konfigürasyon.setAllowCredentials(true);
        konfigürasyon.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource kaynak = new UrlBasedCorsConfigurationSource();
        kaynak.registerCorsConfiguration("/**", konfigürasyon);
        return kaynak;
    }
}
