package com.scinar.giderlerim.service;

/** Yeni hesap kaydı commit edildikten sonra doğrulama e-postası göndermek için yayınlanır. */
public record KullaniciKaydedildiEvent(String email) {}
