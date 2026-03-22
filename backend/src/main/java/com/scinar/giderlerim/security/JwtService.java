package com.scinar.giderlerim.security;

import com.scinar.giderlerim.entity.Kullanici;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
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

    @Value("${jwt.secret}")
    private String gizliAnahtar;

    @Value("${jwt.expiration.access}")
    private long accessTokenGecerlilik;

    @Value("${jwt.expiration.refresh}")
    private long refreshTokenGecerlilik;

    private SecretKey getSigningKey() {
        byte[] anahtarBayt = gizliAnahtar.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(anahtarBayt);
    }

    public String generateAccessToken(Kullanici kullanici) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", kullanici.getId());
        claims.put("email", kullanici.getEmail());
        claims.put("plan", kullanici.getPlan().name());
        return buildToken(claims, kullanici.getEmail(), accessTokenGecerlilik);
    }

    public String generateRefreshToken(Long kullaniciId) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", kullaniciId);
        claims.put("tip", "refresh");
        return buildToken(claims, kullaniciId.toString(), refreshTokenGecerlilik);
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
            return email.equals(userDetails.getUsername()) && !isTokenExpired(token);
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
