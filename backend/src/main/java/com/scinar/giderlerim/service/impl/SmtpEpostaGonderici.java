package com.scinar.giderlerim.service.impl;

import com.scinar.giderlerim.service.EpostaGonderici;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.mail.enabled", havingValue = "true")
public class SmtpEpostaGonderici implements EpostaGonderici {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String gonderen;

    @Override
    public boolean kullanilabilir() {
        return true;
    }

    @Override
    public void hesapBaglantisiGonder(String alici, String konu, String aciklama, String baglanti) {
        SimpleMailMessage mesaj = new SimpleMailMessage();
        mesaj.setFrom(gonderen);
        mesaj.setTo(alici);
        mesaj.setSubject(konu);
        mesaj.setText(aciklama + "\n\n" + baglanti);
        mailSender.send(mesaj);
    }
}
