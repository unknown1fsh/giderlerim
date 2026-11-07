package com.scinar.giderlerim.service.impl;

import com.scinar.giderlerim.service.HesapGuvenligiService;
import com.scinar.giderlerim.service.KullaniciKaydedildiEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Kayıt işlemi commit edildikten sonra doğrulama e-postasını gönderir.
 * E-posta servisi kapalı veya hatalıysa kayıt başarılı kalır; kullanıcı uygulamadan yeniden isteyebilir.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class KayitEpostaDinleyicisi {

    private final HesapGuvenligiService hesapGuvenligiService;

    @TransactionalEventListener
    public void kayitSonrasiDogrulamaGonder(KullaniciKaydedildiEvent olay) {
        try {
            hesapGuvenligiService.emailDogrulamaTalepEt(olay.email());
        } catch (RuntimeException e) {
            log.warn("Kayıt sonrası doğrulama e-postası gönderilemedi: {}", e.getMessage());
        }
    }
}
