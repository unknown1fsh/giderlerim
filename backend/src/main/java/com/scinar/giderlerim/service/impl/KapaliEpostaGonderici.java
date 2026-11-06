package com.scinar.giderlerim.service.impl;

import com.scinar.giderlerim.service.EpostaGonderici;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(name = "app.mail.enabled", havingValue = "false", matchIfMissing = true)
public class KapaliEpostaGonderici implements EpostaGonderici {
    @Override
    public boolean kullanilabilir() {
        return false;
    }

    @Override
    public void hesapBaglantisiGonder(String alici, String konu, String aciklama, String baglanti) {
        throw new IllegalStateException("E-posta servisi yapılandırılmamış.");
    }
}
