package com.scinar.giderlerim.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.scinar.giderlerim.config.ShopierAyarlari;
import com.scinar.giderlerim.dto.admin.ShopierSiparisDto;
import com.scinar.giderlerim.dto.response.SayfaliResponse;
import com.scinar.giderlerim.entity.Kullanici;
import com.scinar.giderlerim.entity.OdemeBildirimi;
import com.scinar.giderlerim.entity.ShopierSiparisi;
import com.scinar.giderlerim.entity.enums.SiparisDurumu;
import com.scinar.giderlerim.exception.KayitBulunamadiException;
import com.scinar.giderlerim.repository.KullaniciRepository;
import com.scinar.giderlerim.repository.OdemeBildirimiRepository;
import com.scinar.giderlerim.repository.ShopierSiparisiRepository;
import com.scinar.giderlerim.service.AbonelikService;
import com.scinar.giderlerim.service.ShopierOdemeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Locale;
import java.util.Optional;
import java.util.stream.StreamSupport;

@Slf4j
@Service
@RequiredArgsConstructor
public class ShopierOdemeServiceImpl implements ShopierOdemeService {

    static final String SIPARIS_OLUSTURULDU = "order.created";
    static final String IADE_GUNCELLENDI = "refund.updated";
    private static final String BEKLENEN_PARA_BIRIMI = "TRY";
    private static final int MAX_SAYFA_BOYUTU = 100;

    private final OdemeBildirimiRepository bildirimRepository;
    private final ShopierSiparisiRepository siparisRepository;
    private final KullaniciRepository kullaniciRepository;
    private final AbonelikService abonelikService;
    private final ShopierAyarlari ayarlar;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public void bildirimIsle(String webhookId, String olay, byte[] hamGovde) {
        byte[] govde = hamGovde != null ? hamGovde : new byte[0];
        String govdeIzi = sha256Hex(govde);
        String kimlik = webhookId != null && !webhookId.isBlank() ? webhookId.trim() : "govde:" + govdeIzi;
        String olayAdi = olay != null ? olay.trim() : "";

        if (bildirimRepository.existsByWebhookId(kimlik)) {
            log.info("Shopier bildirimi daha önce işlendi, atlandı (olay={}, iz={})", olayAdi, govdeIzi.substring(0, 12));
            return;
        }
        bildirimRepository.save(OdemeBildirimi.builder().webhookId(kimlik).olay(olayAdi).govdeIzi(govdeIzi).build());

        JsonNode kok;
        try {
            kok = objectMapper.readTree(new String(govde, StandardCharsets.UTF_8));
        } catch (IOException e) {
            log.warn("Shopier bildirimi JSON olarak okunamadı (olay={}, iz={})", olayAdi, govdeIzi.substring(0, 12));
            return;
        }
        if (kok == null || !kok.isObject()) {
            log.warn("Shopier bildirim gövdesi nesne değil (olay={})", olayAdi);
            return;
        }

        switch (olayAdi) {
            case SIPARIS_OLUSTURULDU -> siparisIsle(kok);
            case IADE_GUNCELLENDI -> iadeIsle(kok);
            default -> log.info("İşlenmeyen Shopier olayı yok sayıldı: {}", olayAdi);
        }
    }

    private void siparisIsle(JsonNode siparisJson) {
        String shopierSiparisId = metin(siparisJson, "id");
        if (shopierSiparisId == null) {
            log.warn("Sipariş kimliği olmayan order.created bildirimi yok sayıldı.");
            return;
        }
        if (siparisRepository.findByShopierSiparisId(shopierSiparisId).isPresent()) {
            log.info("Shopier siparişi daha önce kaydedildi, atlandı. Sipariş: {}", shopierSiparisId);
            return;
        }

        ShopierSiparisi siparis = ShopierSiparisi.builder()
                .shopierSiparisId(shopierSiparisId)
                .tutar(tutarOku(siparisJson.path("totals").path("total")))
                .paraBirimi(metin(siparisJson, "currency"))
                .aliciEmail(aliciEmailOku(siparisJson))
                .build();

        Optional<String> tanimliUrunId = urunKimlikleri(siparisJson)
                .filter(id -> ayarlar.urun(id).isPresent())
                .findFirst();
        siparis.setUrunId(tanimliUrunId.orElseGet(() -> urunKimlikleri(siparisJson).findFirst().orElse(null)));
        tanimliUrunId.flatMap(ayarlar::urun).ifPresent(urun -> {
            siparis.setPlan(urun.plan());
            siparis.setDonem(urun.donem());
        });

        if (!"paid".equalsIgnoreCase(metin(siparisJson, "paymentStatus"))) {
            kaydet(siparis, SiparisDurumu.ODENMEDI, "Ödeme durumu 'paid' değil.");
            return;
        }
        if (tanimliUrunId.isEmpty()) {
            kaydet(siparis, SiparisDurumu.URUN_TANIMSIZ, "Siparişte plan ile eşlenmiş ürün yok.");
            return;
        }
        BigDecimal beklenen = ayarlar.urun(tanimliUrunId.get()).map(ShopierAyarlari.UrunTanimi::fiyat).orElse(null);
        if (!tutarUygun(siparis, beklenen)) {
            kaydet(siparis, SiparisDurumu.TUTAR_UYUSMUYOR,
                    "Beklenen en az " + beklenen + " " + BEKLENEN_PARA_BIRIMI + "; gelen "
                            + siparis.getTutar() + " " + siparis.getParaBirimi() + ".");
            return;
        }

        Optional<Kullanici> kullanici = Optional.ofNullable(siparis.getAliciEmail())
                .flatMap(kullaniciRepository::findByEmailAndDeletedAtIsNull);
        if (kullanici.isEmpty()) {
            kaydet(siparis, SiparisDurumu.KULLANICI_BULUNAMADI,
                    "Alıcı e-postasıyla kayıtlı kullanıcı bulunamadı; admin eşleştirmesi gerekiyor.");
            return;
        }

        siparis.setKullanici(kullanici.get());
        kaydet(siparis, SiparisDurumu.ISLENDI, null);
        abonelikService.shopierAboneligiBaslat(kullanici.get(), siparis.getPlan(), siparis.getDonem(), siparis);
    }

    private void iadeIsle(JsonNode iadeJson) {
        if (!"succeeded".equalsIgnoreCase(metin(iadeJson, "status"))) {
            log.info("Tamamlanmamış iade bildirimi yok sayıldı (durum={})", metin(iadeJson, "status"));
            return;
        }
        String siparisId = metin(iadeJson, "orderId");
        Optional<ShopierSiparisi> siparis = siparisId == null ? Optional.empty()
                : siparisRepository.findByShopierSiparisId(siparisId);
        if (siparis.isEmpty()) {
            log.warn("İade bildirimi kayıtlı olmayan bir sipariş için geldi. Sipariş: {}", siparisId);
            return;
        }

        ShopierSiparisi kayit = siparis.get();
        if ("full".equalsIgnoreCase(metin(iadeJson, "type"))) {
            kayit.setDurum(SiparisDurumu.IADE_EDILDI);
            kayit.setAciklama("Tam iade yapıldı; bağlı abonelik iptal edildi.");
            siparisRepository.save(kayit);
            abonelikService.siparisAbonelikleriniIptalEt(kayit);
        } else {
            kayit.setDurum(SiparisDurumu.KISMI_IADE);
            kayit.setAciklama("Kısmi iade yapıldı; plan değiştirilmedi, admin incelemesi gerekiyor.");
            siparisRepository.save(kayit);
        }
        log.info("Shopier iadesi işlendi. Sipariş: {}, durum: {}", siparisId, kayit.getDurum());
    }

    @Override
    @Transactional(readOnly = true)
    public SayfaliResponse<ShopierSiparisDto> siparisleriListele(SiparisDurumu durum, int sayfa, int boyut) {
        PageRequest istek = PageRequest.of(Math.max(sayfa, 0), Math.min(Math.max(boyut, 1), MAX_SAYFA_BOYUTU));
        Page<ShopierSiparisi> sonuc = durum == null
                ? siparisRepository.findAllByOrderByCreatedAtDesc(istek)
                : siparisRepository.findByDurumOrderByCreatedAtDesc(durum, istek);
        return new SayfaliResponse<>(
                sonuc.getContent().stream().map(this::dto).toList(),
                sonuc.getNumber(), sonuc.getSize(), sonuc.getTotalElements(), sonuc.getTotalPages(), sonuc.isLast());
    }

    @Override
    @Transactional
    public ShopierSiparisDto siparisiKullaniciyaAta(Long siparisId, Long kullaniciId) {
        ShopierSiparisi siparis = siparisRepository.findById(siparisId)
                .orElseThrow(() -> new KayitBulunamadiException("Sipariş bulunamadı."));
        if (siparis.getDurum() != SiparisDurumu.KULLANICI_BULUNAMADI && siparis.getDurum() != SiparisDurumu.TUTAR_UYUSMUYOR) {
            throw new IllegalArgumentException("Yalnızca kullanıcısı bulunamayan veya tutarı uyuşmayan siparişler elle atanabilir.");
        }
        if (siparis.getPlan() == null || siparis.getDonem() == null) {
            throw new IllegalArgumentException("Siparişin ürünü bir planla eşlenmemiş.");
        }
        Kullanici kullanici = kullaniciRepository.findById(kullaniciId)
                .filter(k -> k.getDeletedAt() == null)
                .orElseThrow(() -> new KayitBulunamadiException("Kullanıcı bulunamadı."));

        siparis.setKullanici(kullanici);
        kaydet(siparis, SiparisDurumu.ISLENDI, "Admin tarafından kullanıcıya atandı.");
        abonelikService.shopierAboneligiBaslat(kullanici, siparis.getPlan(), siparis.getDonem(), siparis);
        return dto(siparis);
    }

    // ========== Yardımcılar ==========

    private void kaydet(ShopierSiparisi siparis, SiparisDurumu durum, String aciklama) {
        siparis.setDurum(durum);
        siparis.setAciklama(aciklama);
        siparisRepository.save(siparis);
        if (durum != SiparisDurumu.ISLENDI) {
            log.warn("Shopier siparişi otomatik işlenemedi. Sipariş: {}, durum: {}", siparis.getShopierSiparisId(), durum);
        }
    }

    private boolean tutarUygun(ShopierSiparisi siparis, BigDecimal beklenen) {
        if (beklenen == null) {
            return true;
        }
        return BEKLENEN_PARA_BIRIMI.equalsIgnoreCase(siparis.getParaBirimi())
                && siparis.getTutar() != null
                && siparis.getTutar().compareTo(beklenen) >= 0;
    }

    private java.util.stream.Stream<String> urunKimlikleri(JsonNode siparisJson) {
        JsonNode kalemler = siparisJson.path("lineItems");
        if (!kalemler.isArray()) {
            return java.util.stream.Stream.empty();
        }
        return StreamSupport.stream(kalemler.spliterator(), false)
                .map(kalem -> metin(kalem, "productId"))
                .filter(id -> id != null);
    }

    private String aliciEmailOku(JsonNode siparisJson) {
        String email = metin(siparisJson.path("billingInfo"), "email");
        if (email == null) {
            email = metin(siparisJson.path("shippingInfo"), "email");
        }
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }

    private static BigDecimal tutarOku(JsonNode dugum) {
        if (dugum == null || dugum.isMissingNode() || dugum.isNull()) {
            return null;
        }
        try {
            return new BigDecimal(dugum.asText().trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private static String metin(JsonNode dugum, String alan) {
        JsonNode deger = dugum.path(alan);
        if (deger.isMissingNode() || deger.isNull()) {
            return null;
        }
        String metin = deger.asText().trim();
        return metin.isEmpty() ? null : metin;
    }

    private ShopierSiparisDto dto(ShopierSiparisi s) {
        Kullanici k = s.getKullanici();
        return new ShopierSiparisDto(s.getId(), s.getShopierSiparisId(), s.getUrunId(), s.getPlan(), s.getDonem(),
                s.getTutar(), s.getParaBirimi(), s.getAliciEmail(),
                k != null ? k.getId() : null, k != null ? k.getEmail() : null,
                s.getDurum(), s.getAciklama(), s.getCreatedAt());
    }

    private static String sha256Hex(byte[] veri) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(veri));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 kullanılamıyor.", e);
        }
    }
}
