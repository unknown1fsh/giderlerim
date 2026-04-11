package com.scinar.giderlerim.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.scinar.giderlerim.config.OpenAiConfig;
import com.scinar.giderlerim.dto.request.SohbetMesajiRequest;
import com.scinar.giderlerim.dto.response.ApiResponse;
import com.scinar.giderlerim.dto.response.SohbetMesajiResponse;
import com.scinar.giderlerim.dto.response.SohbetOturumResponse;
import com.scinar.giderlerim.entity.AiSohbetMesaji;
import com.scinar.giderlerim.entity.AiSohbetOturumu;
import com.scinar.giderlerim.entity.Butce;
import com.scinar.giderlerim.entity.Gider;
import com.scinar.giderlerim.entity.Kullanici;
import com.scinar.giderlerim.entity.enums.MesajRolu;
import com.scinar.giderlerim.entity.enums.OdemeYontemi;
import com.scinar.giderlerim.entity.enums.PlanTuru;
import com.scinar.giderlerim.exception.KayitBulunamadiException;
import com.scinar.giderlerim.exception.PlanLimitiAsimException;
import com.scinar.giderlerim.repository.*;
import com.scinar.giderlerim.service.AiSohbetService;
import com.scinar.giderlerim.util.TarihYardimcisi;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiSohbetServiceImpl implements AiSohbetService {

    private static final String OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
    private static final int MESAJ_BAGLAM_LIMITI = 10;

    private static final String SISTEM_PROMPT = """
            Sen Türk kullanıcılar için tasarlanmış, giderlerim.net uygulamasının finans koçusun.
            Kullanıcının finansal verilerini analiz ederek kişiselleştirilmiş, pratik öneriler sunarsın.
            Tüm yanıtların Türkçe olacak. Gereksiz teknik jargon kullanma. Samimi ve destekleyici bir ton kullan.
            Kullanıcıya verilen bağlam bilgisini kullanarak kişiselleştirilmiş yanıtlar ver.
            Finansal tavsiye verirken Türkiye ekonomik koşullarını göz önünde bulundur.
            Asla yanıltıcı veya riskli finansal tavsiyeler verme.
            """;

    private final OpenAiConfig openAiConfig;
    private final RestTemplate restTemplate;
    private final KullaniciRepository kullaniciRepository;
    private final GiderRepository giderRepository;
    private final ButceRepository butceRepository;
    private final AiSohbetOturumRepository oturumRepository;
    private final AiSohbetMesajiRepository mesajRepository;

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<SohbetOturumResponse>> getOturumlar(Long kullaniciId) {
        Kullanici kullanici = kullaniciGetir(kullaniciId);
        planKontrolEt(kullanici);

        List<SohbetOturumResponse> oturumlar = oturumRepository
                .findByKullaniciIdAndDeletedAtIsNull(kullaniciId)
                .stream()
                .map(this::oturumEntitydenResponse)
                .collect(Collectors.toList());

        return ApiResponse.basarili(oturumlar);
    }

    @Override
    @Transactional
    public ApiResponse<SohbetOturumResponse> yeniOturumBaslat(Long kullaniciId) {
        Kullanici kullanici = kullaniciGetir(kullaniciId);
        planKontrolEt(kullanici);

        AiSohbetOturumu yeniOturum = AiSohbetOturumu.builder()
                .kullanici(kullanici)
                .baslik("Yeni Sohbet - " + LocalDate.now())
                .aktif(true)
                .build();

        AiSohbetOturumu kaydedilen = oturumRepository.save(yeniOturum);
        log.debug("Yeni sohbet oturumu başlatıldı. ID: {}, Kullanıcı: {}", kaydedilen.getId(), kullaniciId);

        return ApiResponse.basarili("Yeni sohbet oturumu başlatıldı.", oturumEntitydenResponse(kaydedilen));
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<SohbetMesajiResponse>> getMesajlar(Long kullaniciId, Long oturumId) {
        Kullanici kullanici = kullaniciGetir(kullaniciId);
        planKontrolEt(kullanici);

        oturumRepository.findByIdAndKullaniciIdAndDeletedAtIsNull(oturumId, kullaniciId)
                .orElseThrow(() -> new KayitBulunamadiException("Sohbet oturumu bulunamadı. ID: " + oturumId));

        List<SohbetMesajiResponse> mesajlar = mesajRepository
                .findByOturumIdOrderByCreatedAtAsc(oturumId)
                .stream()
                .map(this::mesajEntitydenResponse)
                .collect(Collectors.toList());

        return ApiResponse.basarili(mesajlar);
    }

    @Override
    @Transactional
    public ApiResponse<SohbetMesajiResponse> mesajGonder(Long kullaniciId, Long oturumId,
                                                           SohbetMesajiRequest request) {
        Kullanici kullanici = kullaniciGetir(kullaniciId);
        planKontrolEt(kullanici);

        AiSohbetOturumu oturum = oturumRepository.findByIdAndKullaniciIdAndDeletedAtIsNull(oturumId, kullaniciId)
                .orElseThrow(() -> new KayitBulunamadiException("Sohbet oturumu bulunamadı. ID: " + oturumId));

        if (!Boolean.TRUE.equals(oturum.getAktif())) {
            throw new IllegalArgumentException("Bu sohbet oturumu kapatılmış.");
        }

        AiSohbetMesaji kullaniciMesaji = AiSohbetMesaji.builder()
                .oturum(oturum)
                .rol(MesajRolu.KULLANICI)
                .icerik(request.icerik())
                .build();
        mesajRepository.save(kullaniciMesaji);

        List<AiSohbetMesaji> sonMesajlar = mesajRepository.findSonMesajlar(
                oturumId, PageRequest.of(0, MESAJ_BAGLAM_LIMITI)
        );

        Collections.reverse(sonMesajlar);

        String finansalBaglamMetni = finansalBaglamHazirla(kullaniciId);
        String dinamikSistemPrompt = SISTEM_PROMPT + "\n\n" +
                "=== KULLANICI FİNANSAL DURUMU (GÜNCEL) ===\n" + finansalBaglamMetni;

        // OpenAI mesaj formatına çevir (system mesajı ilk sıraya)
        List<Map<String, String>> mesajListesi = new ArrayList<>();

        mesajListesi.add(Map.of("role", "system", "content", dinamikSistemPrompt));

        for (AiSohbetMesaji mesaj : sonMesajlar) {
            if (mesaj.getId().equals(kullaniciMesaji.getId())) {
                continue;
            }
            Map<String, String> mesajMap = new HashMap<>();
            mesajMap.put("role", mesaj.getRol() == MesajRolu.KULLANICI ? "user" : "assistant");
            mesajMap.put("content", mesaj.getIcerik());
            mesajListesi.add(mesajMap);
        }

        mesajListesi.add(Map.of("role", "user", "content", request.icerik()));

        String asistanYaniti = openAiApiCagir(mesajListesi);

        AiSohbetMesaji asistanMesaji = AiSohbetMesaji.builder()
                .oturum(oturum)
                .rol(MesajRolu.ASISTAN)
                .icerik(asistanYaniti)
                .build();
        AiSohbetMesaji kaydedilenAsistanMesaji = mesajRepository.save(asistanMesaji);

        if (oturum.getBaslik() != null && oturum.getBaslik().startsWith("Yeni Sohbet")) {
            String yeniBaslik = request.icerik().length() > 50
                    ? request.icerik().substring(0, 47) + "..."
                    : request.icerik();
            oturum.setBaslik(yeniBaslik);
            oturumRepository.save(oturum);
        }

        return ApiResponse.basarili(mesajEntitydenResponse(kaydedilenAsistanMesaji));
    }

    @Override
    @Transactional
    public ApiResponse<Void> oturumKapat(Long kullaniciId, Long oturumId) {
        Kullanici kullanici = kullaniciGetir(kullaniciId);
        planKontrolEt(kullanici);

        AiSohbetOturumu oturum = oturumRepository.findByIdAndKullaniciIdAndDeletedAtIsNull(oturumId, kullaniciId)
                .orElseThrow(() -> new KayitBulunamadiException("Sohbet oturumu bulunamadı. ID: " + oturumId));

        oturum.setAktif(false);
        oturum.setDeletedAt(LocalDateTime.now());
        oturumRepository.save(oturum);

        return ApiResponse.basarili("Sohbet oturumu kapatıldı.", null);
    }

    // ========== Yardımcı Metodlar ==========

    private String openAiApiCagir(List<Map<String, String>> mesajlar) {
        HttpHeaders basliklar = new HttpHeaders();
        basliklar.setContentType(MediaType.APPLICATION_JSON);
        basliklar.setBearerAuth(openAiConfig.getApiAnahtari());

        Map<String, Object> istek = new HashMap<>();
        istek.put("model", openAiConfig.getModel());
        istek.put("max_tokens", openAiConfig.getMaxTokens());
        istek.put("messages", mesajlar);

        try {
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(istek, basliklar);
            ResponseEntity<String> yanit = restTemplate.exchange(
                    OPENAI_API_URL, HttpMethod.POST, entity, String.class
            );

            String yanitGovdesi = yanit.getBody();
            if (yanitGovdesi == null) {
                throw new RuntimeException("API boş yanıt döndü.");
            }

            ObjectMapper mapper = new ObjectMapper();
            JsonNode node = mapper.readTree(yanitGovdesi);
            return node.path("choices").get(0).path("message").path("content").asText();

        } catch (Exception e) {
            log.error("OpenAI API sohbet çağrısı başarısız: {}", e.getMessage());
            throw new RuntimeException("Yapay zeka servisi şu an kullanılamıyor. Lütfen daha sonra tekrar deneyin.");
        }
    }

    private String finansalBaglamHazirla(Long kullaniciId) {
        int mevcutAy = TarihYardimcisi.mevcutAy();
        int mevcutYil = TarihYardimcisi.mevcutYil();

        BigDecimal aylikToplam = giderRepository.findAylikToplam(kullaniciId, mevcutAy, mevcutYil);
        if (aylikToplam == null) aylikToplam = BigDecimal.ZERO;

        long islemSayisi = giderRepository.countByKullaniciIdAndAyAndYil(kullaniciId, mevcutAy, mevcutYil);
        List<Object[]> kategoriToplamlar = giderRepository.findKategoriToplamlar(kullaniciId, mevcutAy, mevcutYil);

        StringBuilder sb = new StringBuilder();
        sb.append(String.format("=== %d/%d AYI ÖZETİ ===\n", mevcutAy, mevcutYil));
        sb.append(String.format("Toplam harcama: %.2f TL\n", aylikToplam.doubleValue()));
        sb.append(String.format("İşlem sayısı: %d\n", islemSayisi));

        if (!kategoriToplamlar.isEmpty()) {
            sb.append("\n--- KATEGORİ DAĞILIMI ---\n");
            for (Object[] satir : kategoriToplamlar) {
                String kategoriAd = (String) satir[1];
                BigDecimal toplam = (BigDecimal) satir[4];
                sb.append(String.format("  - %s: %.2f TL\n", kategoriAd, toplam.doubleValue()));
            }
        }

        List<Butce> butceler = butceRepository.findByKullaniciIdAndAyAndYilAndDeletedAtIsNull(kullaniciId, mevcutAy, mevcutYil);
        if (!butceler.isEmpty()) {
            sb.append("\n--- BÜTÇE DURUMU ---\n");
            for (Butce butce : butceler) {
                BigDecimal harcanan = giderRepository.findKategoriAylikToplam(
                        kullaniciId, butce.getKategori().getId(), mevcutAy, mevcutYil);
                if (harcanan == null) harcanan = BigDecimal.ZERO;
                BigDecimal limit = butce.getLimitTutar();
                int yuzde = limit.compareTo(BigDecimal.ZERO) > 0
                        ? harcanan.multiply(BigDecimal.valueOf(100)).divide(limit, 0, RoundingMode.HALF_UP).intValue()
                        : 0;
                String uyari = yuzde >= 100 ? " ASILDI" : (yuzde >= butce.getUyariYuzdesi() ? " SINIRA YAKLASIYOR" : "");
                sb.append(String.format("  - %s: %.2f / %.2f TL (%%%d)%s\n",
                        butce.getKategori().getAd(), harcanan.doubleValue(), limit.doubleValue(), yuzde, uyari));
            }
        }

        LocalDate ayBaslangic = LocalDate.of(mevcutYil, mevcutAy, 1);
        List<Gider> sonIslemler = giderRepository.findSon3AyGiderler(kullaniciId, ayBaslangic);
        if (!sonIslemler.isEmpty()) {
            sb.append("\n--- SON 10 İŞLEM ---\n");
            sonIslemler.stream().limit(10).forEach(g -> {
                String aciklama = g.getAciklama() != null && !g.getAciklama().isBlank()
                        ? g.getAciklama() : "-";
                sb.append(String.format("  - %s | %s | %s | %.2f TL\n",
                        g.getTarih(), g.getKategori().getAd(), aciklama, g.getTutar().doubleValue()));
            });
        }

        BigDecimal krediKarti = giderRepository.findAylikToplamByOdemeYontemi(kullaniciId, mevcutAy, mevcutYil, OdemeYontemi.KREDI_KARTI);
        BigDecimal bankaKarti = giderRepository.findAylikToplamByOdemeYontemi(kullaniciId, mevcutAy, mevcutYil, OdemeYontemi.BANKA_KARTI);
        BigDecimal nakit = giderRepository.findAylikToplamByOdemeYontemi(kullaniciId, mevcutAy, mevcutYil, OdemeYontemi.NAKIT);
        if (krediKarti == null) krediKarti = BigDecimal.ZERO;
        if (bankaKarti == null) bankaKarti = BigDecimal.ZERO;
        if (nakit == null) nakit = BigDecimal.ZERO;

        sb.append("\n--- ÖDEME YÖNTEMİ ---\n");
        sb.append(String.format("  Kredi Kartı: %.2f TL | Banka Kartı: %.2f TL | Nakit: %.2f TL\n",
                krediKarti.doubleValue(), bankaKarti.doubleValue(), nakit.doubleValue()));

        return sb.toString();
    }

    private Kullanici kullaniciGetir(Long kullaniciId) {
        return kullaniciRepository.findById(kullaniciId)
                .orElseThrow(() -> new KayitBulunamadiException("Kullanıcı bulunamadı."));
    }

    private void planKontrolEt(Kullanici kullanici) {
        if (kullanici.getPlan() == PlanTuru.FREE) {
            throw new PlanLimitiAsimException(
                    "AI Sohbet özelliği yalnızca PREMIUM ve ULTRA plan kullanıcılarına sunulmaktadır. " +
                    "Planınızı yükselterek bu özelliğe erişebilirsiniz."
            );
        }
    }

    private SohbetOturumResponse oturumEntitydenResponse(AiSohbetOturumu oturum) {
        return new SohbetOturumResponse(
                oturum.getId(),
                oturum.getBaslik(),
                Boolean.TRUE.equals(oturum.getAktif()),
                oturum.getCreatedAt(),
                oturum.getUpdatedAt()
        );
    }

    private SohbetMesajiResponse mesajEntitydenResponse(AiSohbetMesaji mesaj) {
        return new SohbetMesajiResponse(
                mesaj.getId(),
                mesaj.getRol(),
                mesaj.getIcerik(),
                mesaj.getCreatedAt()
        );
    }
}
