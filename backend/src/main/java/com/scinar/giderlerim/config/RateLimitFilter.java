package com.scinar.giderlerim.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

@Slf4j
@Component
@Order(1)
public class RateLimitFilter extends OncePerRequestFilter {

    private static final int AUTH_MAX_REQUESTS = 10;
    private static final int AI_MAX_REQUESTS = 20;
    private static final int MAX_KEYS = 10_000;
    private static final long WINDOW_MS = 60_000; // 1 dakika

    private final ConcurrentHashMap<String, RateInfo> rateLimits = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        String grup;
        int maxRequests;
        if (path.startsWith("/api/v1/auth/")) {
            grup = "auth";
            maxRequests = AUTH_MAX_REQUESTS;
        } else if (path.startsWith("/api/v1/ai/")) {
            grup = "ai";
            maxRequests = AI_MAX_REQUESTS;
        } else {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = request.getRemoteAddr();
        String key = clientIp + ":" + grup;
        long now = System.currentTimeMillis();
        RateInfo rateInfo;
        synchronized (rateLimits) {
            if (!rateLimits.containsKey(key) && rateLimits.size() >= MAX_KEYS) {
                rateLimits.entrySet().removeIf(entry -> now - entry.getValue().windowStart.get() >= WINDOW_MS);
            }
            if (!rateLimits.containsKey(key) && rateLimits.size() >= MAX_KEYS) {
                rateInfo = null;
            } else {
                rateInfo = rateLimits.compute(key, (k, existing) -> {
                    if (existing == null || now - existing.windowStart.get() >= WINDOW_MS) {
                        return new RateInfo(new AtomicLong(now), new AtomicInteger(1));
                    }
                    existing.count.incrementAndGet();
                    return existing;
                });
            }
        }

        if (rateInfo == null || rateInfo.count.get() > maxRequests) {
            log.warn("Rate limit asildi. IP: {}, Path: {}", clientIp, path);
            rateLimitResponse(response);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private void rateLimitResponse(HttpServletResponse response) throws IOException {
        response.setStatus(429);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("success", false);
        body.put("message", "Çok fazla istek gönderildi. Lütfen bir dakika bekleyip tekrar deneyin.");
        body.put("data", null);
        objectMapper.writeValue(response.getWriter(), body);
    }

    private record RateInfo(AtomicLong windowStart, AtomicInteger count) {}
}
