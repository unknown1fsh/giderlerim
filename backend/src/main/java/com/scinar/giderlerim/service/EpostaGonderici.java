package com.scinar.giderlerim.service;

public interface EpostaGonderici {
    boolean kullanilabilir();
    void hesapBaglantisiGonder(String alici, String konu, String aciklama, String baglanti);
}
