package com.scinar.giderlerim.service;

import com.scinar.giderlerim.dto.admin.ShopierSiparisDto;
import com.scinar.giderlerim.dto.response.SayfaliResponse;
import com.scinar.giderlerim.entity.enums.SiparisDurumu;

public interface ShopierOdemeService {

    /**
     * İmzası doğrulanmış bir Shopier bildirimini işler. Aynı webhook kimliği ikinci kez işlenmez.
     * İş kuralı uyuşmazlıkları (ürün/tutar/kullanıcı) sipariş kaydına yazılır, istisna fırlatılmaz;
     * yalnızca beklenmeyen hatalar (ör. veritabanı) yukarı iletilir ki Shopier yeniden denesin.
     */
    void bildirimIsle(String webhookId, String olay, byte[] hamGovde);

    SayfaliResponse<ShopierSiparisDto> siparisleriListele(SiparisDurumu durum, int sayfa, int boyut);

    /** Otomatik eşleşmeyen bir siparişi admin onayıyla kullanıcıya bağlar ve aboneliği başlatır. */
    ShopierSiparisDto siparisiKullaniciyaAta(Long siparisId, Long kullaniciId);
}
