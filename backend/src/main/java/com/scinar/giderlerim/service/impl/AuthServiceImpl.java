package com.scinar.giderlerim.service.impl;

import com.scinar.giderlerim.dto.request.GirisRequest;
import com.scinar.giderlerim.dto.request.KayitRequest;
import com.scinar.giderlerim.dto.response.ApiResponse;
import com.scinar.giderlerim.dto.response.TokenResponse;
import com.scinar.giderlerim.entity.Kullanici;
import com.scinar.giderlerim.entity.enums.ParaBirimi;
import com.scinar.giderlerim.entity.enums.PlanTuru;
import com.scinar.giderlerim.exception.KayitBulunamadiException;
import com.scinar.giderlerim.repository.KullaniciRepository;
import com.scinar.giderlerim.security.JwtService;
import com.scinar.giderlerim.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final KullaniciRepository kullaniciRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Override
    @Transactional
    public ApiResponse<TokenResponse> kayitOl(KayitRequest request) {
        if (kullaniciRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Bu e-posta adresi zaten kullanılmaktadır: " + request.email());
        }

        Kullanici yeniKullanici = Kullanici.builder()
                .ad(request.ad())
                .soyad(request.soyad())
                .email(request.email().toLowerCase().trim())
                .sifreHash(passwordEncoder.encode(request.sifre()))
                .plan(PlanTuru.FREE)
                .paraBirimi(ParaBirimi.TRY)
                .aktif(true)
                .emailDogrulandi(false)
                .build();

        Kullanici kaydedilenKullanici = kullaniciRepository.save(yeniKullanici);
        log.info("Yeni kullanıcı kaydı oluşturuldu. ID: {}", kaydedilenKullanici.getId());

        String accessToken = jwtService.generateAccessToken(kaydedilenKullanici);
        String refreshToken = jwtService.generateRefreshToken(kaydedilenKullanici.getId());

        return ApiResponse.basarili("Kayıt başarıyla tamamlandı.", new TokenResponse(accessToken, refreshToken));
    }

    @Override
    @Transactional
    public ApiResponse<TokenResponse> girisYap(GirisRequest request) {
        Kullanici kullanici = kullaniciRepository
                .findByEmailAndDeletedAtIsNull(request.email().toLowerCase().trim())
                .orElseThrow(() -> new BadCredentialsException("E-posta veya şifre hatalı."));

        if (!kullanici.isEnabled()) {
            throw new BadCredentialsException("Hesabınız aktif değil.");
        }

        if (!passwordEncoder.matches(request.sifre(), kullanici.getSifreHash())) {
            throw new BadCredentialsException("E-posta veya şifre hatalı.");
        }

        kullanici.setSonGirisTarihi(LocalDateTime.now());
        kullaniciRepository.save(kullanici);

        String accessToken = jwtService.generateAccessToken(kullanici);
        String refreshToken = jwtService.generateRefreshToken(kullanici.getId());

        log.debug("Kullanıcı girişi başarılı. ID: {}", kullanici.getId());

        return ApiResponse.basarili(new TokenResponse(accessToken, refreshToken));
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<TokenResponse> tokenYenile(String refreshToken) {
        if (jwtService.isTokenExpired(refreshToken)) {
            throw new IllegalArgumentException("Refresh token süresi dolmuştur. Lütfen tekrar giriş yapınız.");
        }

        Long kullaniciId = jwtService.getUserIdFromToken(refreshToken);
        if (kullaniciId == null) {
            throw new IllegalArgumentException("Geçersiz refresh token.");
        }

        Kullanici kullanici = kullaniciRepository.findById(kullaniciId)
                .orElseThrow(() -> new KayitBulunamadiException("Kullanıcı bulunamadı."));

        if (!kullanici.isEnabled()) {
            throw new IllegalArgumentException("Hesabınız aktif değil.");
        }

        String yeniAccessToken = jwtService.generateAccessToken(kullanici);
        String yeniRefreshToken = jwtService.generateRefreshToken(kullanici.getId());

        return ApiResponse.basarili(new TokenResponse(yeniAccessToken, yeniRefreshToken));
    }
}
