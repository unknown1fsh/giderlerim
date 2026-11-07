package com.scinar.giderlerim.service.impl;

import com.scinar.giderlerim.entity.HesapToken;
import com.scinar.giderlerim.entity.Kullanici;
import com.scinar.giderlerim.entity.enums.HesapTokenTuru;
import com.scinar.giderlerim.exception.ServisKullanilamiyorException;
import com.scinar.giderlerim.repository.HesapTokenRepository;
import com.scinar.giderlerim.repository.KullaniciRepository;
import com.scinar.giderlerim.service.EpostaGonderici;
import com.scinar.giderlerim.service.HesapGuvenligiService;
import com.scinar.giderlerim.util.HesapTokenGuvenligi;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class HesapGuvenligiServiceImpl implements HesapGuvenligiService {

    private static final String GENEL_TALEP_MESAJI =
            "E-posta servisi şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyiniz.";

    private final HesapTokenRepository tokenRepository;
    private final KullaniciRepository kullaniciRepository;
    private final PasswordEncoder passwordEncoder;
    private final EpostaGonderici epostaGonderici;

    @Value("${app.public-url:http://localhost:3000}")
    private String publicUrl;

    @Override
    public void emailDogrulamaTalepEt(String email) {
        talepOlustur(email, HesapTokenTuru.EMAIL_DOGRULAMA, "/email-dogrula",
                "E-posta adresinizi doğrulayın", "E-posta adresinizi doğrulamak için bağlantıyı açın.");
    }

    @Override
    public void sifreSifirlamaTalepEt(String email) {
        talepOlustur(email, HesapTokenTuru.SIFRE_SIFIRLAMA, "/sifre-sifirla",
                "Şifrenizi sıfırlayın", "Şifrenizi sıfırlamak için bağlantıyı açın.");
    }

    private void talepOlustur(String email, HesapTokenTuru tur, String path, String konu, String aciklama) {
        if (!epostaGonderici.kullanilabilir()) {
            throw new ServisKullanilamiyorException(GENEL_TALEP_MESAJI);
        }

        kullaniciRepository.findByEmailAndDeletedAtIsNull(email.toLowerCase().trim())
                // Zaten doğrulanmış hesaba tekrar doğrulama bağlantısı gönderilmez.
                .filter(kullanici -> tur != HesapTokenTuru.EMAIL_DOGRULAMA
                        || !Boolean.TRUE.equals(kullanici.getEmailDogrulandi()))
                .ifPresent(kullanici -> tokenOlusturVeGonder(kullanici, tur, path, konu, aciklama));
    }

    private void tokenOlusturVeGonder(Kullanici kullanici, HesapTokenTuru tur,
                                      String path, String konu, String aciklama) {
        String hamToken = HesapTokenGuvenligi.yeniToken();
        HesapToken token = tokenRepository.save(HesapToken.builder()
                .kullanici(kullanici)
                .tur(tur)
                .tokenHash(HesapTokenGuvenligi.hash(hamToken))
                .sonKullanmaTarihi(LocalDateTime.now().plusMinutes(30))
                .build());
        String baglanti = UriComponentsBuilder.fromUriString(publicUrl)
                .path(path)
                .queryParam("token", hamToken)
                .build().encode().toUriString();
        try {
            epostaGonderici.hesapBaglantisiGonder(kullanici.getEmail(), konu, aciklama, baglanti);
        } catch (RuntimeException ex) {
            tokenRepository.delete(token);
            throw new ServisKullanilamiyorException(GENEL_TALEP_MESAJI);
        }
    }

    @Override
    @Transactional
    public void emailDogrula(String hamToken) {
        HesapToken token = kullanilabilirToken(hamToken, HesapTokenTuru.EMAIL_DOGRULAMA);
        token.getKullanici().setEmailDogrulandi(true);
        token.setKullanildiAt(LocalDateTime.now());
    }

    @Override
    @Transactional
    public void sifreSifirla(String hamToken, String yeniSifre) {
        HesapToken token = kullanilabilirToken(hamToken, HesapTokenTuru.SIFRE_SIFIRLAMA);
        token.getKullanici().setSifreHash(passwordEncoder.encode(yeniSifre));
        // Sıfırlama bağlantısını açabilmek, e-posta kutusunun sahibi olmayı kanıtlar.
        token.getKullanici().setEmailDogrulandi(true);
        token.setKullanildiAt(LocalDateTime.now());
    }

    private HesapToken kullanilabilirToken(String hamToken, HesapTokenTuru tur) {
        HesapToken token = tokenRepository.findByTokenHashAndTur(HesapTokenGuvenligi.hash(hamToken), tur)
                .orElseThrow(() -> new IllegalArgumentException("Token geçersiz veya süresi dolmuş."));
        if (!token.kullanilabilir(LocalDateTime.now())) {
            throw new IllegalArgumentException("Token geçersiz veya süresi dolmuş.");
        }
        return token;
    }
}
