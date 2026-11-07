package com.scinar.giderlerim.util;

import java.util.ArrayList;
import java.util.List;

/** İçe aktarma sonucunu kullanıcıya gösterilecek kısa özete çevirir (yükleme kaydının mesaj alanı). */
public final class IceAktarmaOzeti {

    private static final int GOSTERILEN_HATA = 5;
    private static final int MAX_UZUNLUK = 1000;

    private IceAktarmaOzeti() {}

    public static String mesaj(IceAktarmaAyristirici.Sonuc sonuc) {
        List<String> parcalar = new ArrayList<>();
        if (sonuc.atlananSayisi() > 0) {
            parcalar.add(sonuc.atlananSayisi() + " satır gider olmadığı için atlandı (gelir, iade veya kart ödemesi)");
        }
        if (!sonuc.hatalar().isEmpty()) {
            String ornekler = String.join("; ", sonuc.hatalar().subList(0, Math.min(GOSTERILEN_HATA, sonuc.hatalar().size())));
            parcalar.add(sonuc.hatalar().size() + " satır okunamadı: " + ornekler);
        }
        if (parcalar.isEmpty()) {
            return null;
        }
        String mesaj = String.join(". ", parcalar) + ".";
        return mesaj.length() <= MAX_UZUNLUK ? mesaj : mesaj.substring(0, MAX_UZUNLUK - 1) + "…";
    }
}
