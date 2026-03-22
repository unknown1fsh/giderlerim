package com.scinar.giderlerim.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.scinar.giderlerim.config.AnthropicConfig;
import com.scinar.giderlerim.dto.request.SohbetMesajiRequest;
import com.scinar.giderlerim.dto.response.ApiResponse;
import com.scinar.giderlerim.dto.response.SohbetMesajiResponse;
import com.scinar.giderlerim.dto.response.SohbetOturumResponse;
import com.scinar.giderlerim.entity.AiSohbetMesaji;
import com.scinar.giderlerim.entity.AiSohbetOturumu;
import com.scinar.giderlerim.entity.Kullanici;
import com.scinar.giderlerim.entity.enums.MesajRolu;
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
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiSohbetServiceImpl implements AiSohbetService {

    private static final String ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
    private static final String ANTHROPIC_VERSIYONU = "2023-06-01";
    private static final int MESAJ_BAĞLAM_LIMITI = 10;

    private static final String SISTEM_PROMPT = """
            Sen Türk kullanıcılar için tasarlanmış, giderlerim.net uygulamasının finans koçusun.
            Kullanıcının finansal verilerini analiz ederek kişiselleştirilmiş, pratik öneriler sunarsın.
            Tüm yanıtların Türkçe olacak. Gereksiz teknik jargon kullanma. Samimi ve destekleyici bir ton kullan.
            Kullanıcıya verilen bağlam bilgisini kullanarak kişiselleştirilmiş yanıtlar ver.
            Finansal tavsiye verirken Türkiye ekonomik koşullarını göz önünde bulundur.
            Asla yanıltıcı veya riskli finansal tavsiyeler verme.
            """;

    private final AnthropicConfig anthropicConfig;
    private final RestTemplate restTemplate;
    private final KullaniciRepository kullaniciRepository;
    private final GiderRepository giderRepository;
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

        // Kullanıcı mesajını kaydet
        AiSohbetMesaji kullaniciMesaji = AiSohbetMesaji.builder()
                .oturum(oturum)
                .rol(MesajRolu.KULLANICI)
                .icerik(request.icerik())
                .build();
        mesajRepository.save(kullaniciMesaji);

        // Son mesajları bağlam için al
        List<AiSohbetMesaji> sonMesajlar = mesajRepository.findSonMesajlar(
                oturumId, PageRequest.of(0, MESAJ_BAĞLAM_LIMITI)
        );

        // Ters çevir (en eski önce)
        Collections.reverse(sonMesajlar);

        // Kullanıcının harcama özetini hazırla
        String finansalBaglamMetni = finansalBaglamHazirla(kullaniciId);

        // Anthropic mesaj formatına çevir
        List<Map<String, String>> mesajListesi = new ArrayList<>();

        // İlk mesajda finansal bağlamı ekle
        String ilkIcerik = "Bağlam bilgisi:\n" + finansalBaglamMetni + "\n\nKullanıcı: " + request.icerik();

        // Mevcut oturum mesajlarını ekle
        for (AiSohbetMesaji mesaj : sonMesajlar) {
            if (mesaj.getId().equals(kullaniciMesaji.getId())) {
                // En son kullanıcı mesajı zaten bağlamla birlikte ekleneceği için atla
                continue;
            }
            Map<String, String> mesajMap = new HashMap<>();
            mesajMap.put("role", mesaj.getRol() == MesajRolu.KULLANICI ? "user" : "assistant");
            mesajMap.put("content", mesaj.getIcerik());
            mesajListesi.add(mesajMap);
        }

        // Son kullanıcı mesajını bağlamla birlikte ekle
        if (mesajListesi.isEmpty()) {
            Map<String, String> sonMesaj = new HashMap<>();
            sonMesaj.put("role", "user");
            sonMesaj.put("content", ilkIcerik);
            mesajListesi.add(sonMesaj);
        } else {
            Map<String, String> sonMesaj = new HashMap<>();
            sonMesaj.put("role", "user");
            sonMesaj.put("content", request.icerik());
            mesajListesi.add(sonMesaj);
        }

        // Claude API çağrısı
        String asistanYaniti = claudeApiCagir(mesajListesi);

        // Asistan yanıtını kaydet
        AiSohbetMesaji asistanMesaji = AiSohbetMesaji.builder()
                .oturum(oturum)
                .rol(MesajRolu.ASISTAN)
                .icerik(asistanYaniti)
                .build();
        AiSohbetMesaji kaydedilenAsistanMesaji = mesajRepository.save(asistanMesaji);

        // Oturum başlığını ilk mesajdan belirle
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
        kullaniciGetir(kullaniciId);

        AiSohbetOturumu oturum = oturumRepository.findByIdAndKullaniciIdAndDeletedAtIsNull(oturumId, kullaniciId)
                .orElseThrow(() -> new KayitBulunamadiException("Sohbet oturumu bulunamadı. ID: " + oturumId));

        oturum.setAktif(false);
        oturum.setDeletedAt(LocalDateTime.now());
        oturumRepository.save(oturum);

        return ApiResponse.basarili("Sohbet oturumu kapatıldı.", null);
    }

    // ========== Yardımcı Metodlar ==========

    private String claudeApiCagir(List<Map<String, String>> mesajlar) {
        HttpHeaders basliklar = new HttpHeaders();
        basliklar.setContentType(MediaType.APPLICATION_JSON);
        basliklar.set("x-api-key", anthropicConfig.getApiAnahtari());
        basliklar.set("anthropic-version", ANTHROPIC_VERSIYONU);

        Map<String, Object> istek = new HashMap<>();
        istek.put("model", anthropicConfig.getModel());
        istek.put("max_tokens", anthropicConfig.getMaxTokens());
        istek.put("system", SISTEM_PROMPT);
        istek.put("messages", mesajlar);

        try {
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(istek, basliklar);
            ResponseEntity<String> yanit = restTemplate.exchange(
                    ANTHROPIC_API_URL, HttpMethod.POST, entity, String.class
            );

            String yanitGovdesi = yanit.getBody();
            if (yanitGovdesi == null) {
                throw new RuntimeException("API boş yanıt döndü.");
            }

            ObjectMapper mapper = new ObjectMapper();
            JsonNode node = mapper.readTree(yanitGovdesi);
            return node.path("content").get(0).path("text").asText();

        } catch (Exception e) {
            log.error("Claude API sohbet çağrısı başarısız: {}", e.getMessage());
            throw new RuntimeException("Yapay zeka servisi şu an kullanılamıyor. Lütfen daha sonra tekrar deneyin.");
        }
    }

    private String finansalBaglamHazirla(Long kullaniciId) {
        int mevcutAy = TarihYardimcisi.mevcutAy();
        int mevcutYil = TarihYardimcisi.mevcutYil();

        BigDecimal aylikToplam = giderRepository.findAylikToplam(kullaniciId, mevcutAy, mevcutYil);
        if (aylikToplam == null) aylikToplam = BigDecimal.ZERO;

        List<Object[]> kategoriToplamlar = giderRepository.findKategoriToplamlar(kullaniciId, mevcutAy, mevcutYil);

        StringBuilder sb = new StringBuilder();
        sb.append(String.format("Mevcut Ay (%d/%d) Özeti:\n", mevcutAy, mevcutYil));
        sb.append(String.format("Toplam harcama: %.2f TL\n", aylikToplam.doubleValue()));

        if (!kategoriToplamlar.isEmpty()) {
            sb.append("Kategori dağılımı:\n");
            kategoriToplamlar.forEach(satir -> {
                String kategoriAd = (String) satir[1];
                BigDecimal toplam = (BigDecimal) satir[4];
                sb.append(String.format("  - %s: %.2f TL\n", kategoriAd, toplam.doubleValue()));
            });
        }

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
