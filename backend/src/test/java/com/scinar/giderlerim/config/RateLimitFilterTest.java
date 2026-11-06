package com.scinar.giderlerim.config;

import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.util.concurrent.atomic.AtomicInteger;
import java.lang.reflect.Field;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class RateLimitFilterTest {

    @Test
    void sahteXForwardedForAuthLimitiniAsamaz() throws Exception {
        RateLimitFilter filter = new RateLimitFilter();
        AtomicInteger devamEden = new AtomicInteger();
        FilterChain chain = (request, response) -> devamEden.incrementAndGet();

        MockHttpServletResponse sonYanit = null;
        for (int i = 0; i < 11; i++) {
            MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/auth/giris");
            request.setRemoteAddr("127.0.0.1");
            request.addHeader("X-Forwarded-For", "203.0.113." + i);
            sonYanit = new MockHttpServletResponse();
            filter.doFilter(request, sonYanit, chain);
        }

        assertThat(devamEden).hasValue(10);
        assertThat(sonYanit.getStatus()).isEqualTo(429);
    }

    @Test
    void aiYollariDakikadaYirmiIstekleSinirlidir() throws Exception {
        RateLimitFilter filter = new RateLimitFilter();
        AtomicInteger devamEden = new AtomicInteger();
        FilterChain chain = (request, response) -> devamEden.incrementAndGet();

        MockHttpServletResponse sonYanit = null;
        for (int i = 0; i < 21; i++) {
            MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/ai/sohbet/1/mesajlar");
            request.setRemoteAddr("198.51.100.20");
            sonYanit = new MockHttpServletResponse();
            filter.doFilter(request, sonYanit, chain);
        }

        assertThat(devamEden).hasValue(20);
        assertThat(sonYanit.getStatus()).isEqualTo(429);
    }

    @Test
    void anahtarHavuzuOnBinKaydiAsmaz() throws Exception {
        RateLimitFilter filter = new RateLimitFilter();
        FilterChain chain = (request, response) -> { };

        for (int i = 0; i < 10_001; i++) {
            MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/auth/giris");
            request.setRemoteAddr("198.51." + (i / 256) + "." + (i % 256));
            filter.doFilter(request, new MockHttpServletResponse(), chain);
        }

        Field alan = RateLimitFilter.class.getDeclaredField("rateLimits");
        alan.setAccessible(true);
        Map<?, ?> anahtarlar = (Map<?, ?>) alan.get(filter);
        assertThat(anahtarlar).hasSizeLessThanOrEqualTo(10_000);
    }
}

