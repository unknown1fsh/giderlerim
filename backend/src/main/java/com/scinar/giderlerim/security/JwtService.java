package com.scinar.giderlerim.security;

import com.scinar.giderlerim.entity.Kullanici;
import com.scinar.giderlerim.service.SistemParametresiDegerService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Slf4j
@Service
public class JwtService {

    private final SistemParametresiDegerService parametreler;

    public JwtService(SistemParametresiDegerService parametreler) {
        this.parametreler = parametreler;
    }

    @Value("${jwt.secret}")
    private String gizliAnahtar;

    @Value("${jwt.expiration.access}")
    private long accessTokenGecerlilik;

    @Value("${jwt.expiration.refresh}")
    private long refreshTokenGecerlilik;

    /** HS256 en az 256 bit anahtar ister; eksik/kısa anahtarla açılmak her girişte 500 üretir. */
    static final int MIN_ANAHTAR_BAYT = 32;

    @PostConstruct
    void anahtariDogrula() {
        if (gizliAnahtar == null || gizliAnahtar.getBytes(StandardCharsets.UTF_8).length < MIN_ANAHTAR_BAYT) {
            throw new IllegalStateException(
                    "JWT_SECRET tanımlı değil veya " + MIN_ANAHTAR_BAYT + " bayttan kısa. Ortam değişkenini ayarlayın.");
        }
    }

    private SecretKey getSigningKey() {
        byte[] anahtarBayt = gizliAnahtar.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(anahtarBayt);
    }

    public String generateAccessToken(Kullanici kullanici) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", kullanici.getId());
        claims.put("email", kullanici.getEmail());
        claims.put("plan", kullanici.getPlan().name());
        claims.put("adminMi", kullanici.getAdminMi());
        long gecerlilik = parametreler.pozitifLong("jwt.expiration.access", accessTokenGecerlilik);
        return buildToken(claims, kullanici.getEmail(), gecerlilik);
    }

    public String generateRefreshToken(Long kullaniciId) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", kullaniciId);
        claims.put("tip", "refresh");
        long gecerlilik = parametreler.pozitifLong("jwt.expiration.refresh", refreshTokenGecerlilik);
        return buildToken(claims, kullaniciId.toString(), gecerlilik);
    }

    private String buildToken(Map<String, Object> extraClaims, String subject, long expiration) {
        return Jwts.builder()
                .claims(extraClaims)
                .subject(subject)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey())
                .compact();
    }

    public String getEmailFromToken(String token) {
        return getClaimFromToken(token, Claims::getSubject);
    }

    public Long getUserIdFromToken(String token) {
        Claims claims = getAllClaimsFromToken(token);
        Object userIdObj = claims.get("userId");
        if (userIdObj instanceof Integer) {
            return ((Integer) userIdObj).longValue();
        } else if (userIdObj instanceof Long) {
            return (Long) userIdObj;
        }
        return null;
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            final String email = getEmailFromToken(token);
            return email.equals(userDetails.getUsername())
                    && userDetails.isEnabled()
                    && userDetails.isAccountNonLocked()
                    && userDetails.isAccountNonExpired()
                    && !isTokenExpired(token);
        } catch (Exception e) {
            log.debug("Token doğrulama başarısız");
            return false;
        }
    }

    public boolean isTokenExpired(String token) {
        try {
            return getExpirationDateFromToken(token).before(new Date());
        } catch (Exception e) {
            return true;
        }
    }

    public boolean isRefreshToken(String token) {
        try {
            return "refresh".equals(getAllClaimsFromToken(token).get("tip", String.class));
        } catch (Exception e) {
            return false;
        }
    }

    private Date getExpirationDateFromToken(String token) {
        return getClaimFromToken(token, Claims::getExpiration);
    }

    private <T> T getClaimFromToken(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = getAllClaimsFromToken(token);
        return claimsResolver.apply(claims);
    }

    private Claims getAllClaimsFromToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
