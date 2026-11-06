package com.scinar.giderlerim.service;

public interface HesapGuvenligiService {
    void emailDogrulamaTalepEt(String email);
    void emailDogrula(String token);
    void sifreSifirlamaTalepEt(String email);
    void sifreSifirla(String token, String yeniSifre);
}
