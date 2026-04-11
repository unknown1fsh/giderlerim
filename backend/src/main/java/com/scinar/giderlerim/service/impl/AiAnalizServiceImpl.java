package com.scinar.giderlerim.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.scinar.giderlerim.config.OpenAiConfig;
import com.scinar.giderlerim.dto.response.AiAnalizResponse;
import com.scinar.giderlerim.dto.response.ApiResponse;
import com.scinar.giderlerim.entity.AiAnalizSonucu;
import com.scinar.giderlerim.entity.Gider;
import com.scinar.giderlerim.entity.Kullanici;
import com.scinar.giderlerim.entity.enums.AnalizTuru;
import com.scinar.giderlerim.entity.enums.PlanTuru;
import com.scinar.giderlerim.exception.KayitBulunamadiException;
import com.scinar.giderlerim.exception.PlanLimitiAsimException;
import com.scinar.giderlerim.repository.AiAnalizSonucuRepository;
import com.scinar.giderlerim.repository.GiderRepository;
import com.scinar.giderlerim.repository.KullaniciRepository;
import com.scinar.giderlerim.service.AiAnalizService;
import com.scinar.giderlerim.util.TarihYardimcisi;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiAnalizServiceImpl implements AiAnalizService {

    private static final String OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
    private static final int ONBELLEK_SAAT = 6;

    private final OpenAiConfig openAiConfig;
    private final RestTemplate restTemplate;
    private final KullaniciRepository kullaniciRepository;
    private final GiderRepository giderRepository;
    private final AiAnalizSonucuRepository analizSonucuRepository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public ApiResponse<AiAnalizResponse> harcamaAnaliziYap(Long kullaniciId, int ay, int yil) {
        Kullanici kullanici = kullaniciGetir(kullaniciId);
        planKontrolEt(kullanici, PlanTuru.PREMIUM, "Harcama analizi");

        Optional<AiAnalizSonucu> onbellekSonucu = analizSonucuRepository.findGecerliAnaliz(
                kullaniciId, AnalizTuru.HARCAMA_ANALIZI, ay, yil, LocalDateTime.now()
        );

        if (onbellekSonucu.isPresent()) {
            return ApiResponse.basarili(jsondenResponse(onbellekSonucu.get(), true));
        }

        LocalDate baslangic = TarihYardimcisi.ayBaslangici(ay, yil);
        LocalDate bitis = TarihYardimcisi.ayBitisi(ay, yil);
        List<Gider> giderler = giderRepository.findTarihAraligiGiderler(kullaniciId, baslangic, bitis);

        if (giderler.isEmpty()) {
            AiAnalizResponse bos = new AiAnalizResponse(
                    AnalizTuru.HARCAMA_ANALIZI,
                    "Analiz yapılacak yeterli harcama verisi bulunamadı.",
                    List.of("Bu dönemde hiç harcama kaydı bulunmuyor."),
                    List.of("Harcamalarınızı kayıt etmeye başlayın."),
                    "İlk harcamanızı ekleyin",
                    LocalDateTime.now(),
                    false
            );
            return ApiResponse.basarili(bos);
        }

        String harcamaOzeti = harcamaVerisiniHazirla(giderler, ay, yil);

        String sistemPrompt = """
                Sen giderlerim.net uygulamasının yapay zeka destekli kişisel finans analistisisin.
                Türk kullanıcıların finansal verilerini analiz ederek kişiselleştirilmiş, pratik öneriler sunarsın.
                Tüm yanıtların Türkçe olacak. Gereksiz teknik jargon kullanma. Samimi ve destekleyici bir ton kullan.
                Yanıtlarını MUTLAKA aşağıdaki JSON formatında ver:
                {
                  "ozet": "Kısa genel değerlendirme (2-3 cümle)",
                  "bulgular": ["bulgu1", "bulgu2", "bulgu3"],
                  "oneriler": ["öneri1", "öneri2", "öneri3"],
                  "oncelikliEylem": "En önemli tek eylem adımı"
                }
                """;

        String kullaniciMesaji = String.format("""
                Aşağıdaki %d/%d ayı harcama verilerimi analiz et ve finansal durumum hakkında içgörüler sun:

                %s

                Lütfen:
                1. Bu aydaki harcama paternlerimi değerlendir
                2. Özellikle dikkat çekici kategorileri belirt
                3. Tasarruf potansiyeli olan alanları göster
                4. Somut ve uygulanabilir öneriler ver
                """, ay, yil, harcamaOzeti);

        AiAnalizResponse analizResponse = openAiAnalizCagir(kullaniciMesaji, sistemPrompt, AnalizTuru.HARCAMA_ANALIZI);
        sonucuKaydet(kullanici, AnalizTuru.HARCAMA_ANALIZI, ay, yil, analizResponse);

        return ApiResponse.basarili(analizResponse);
    }

    @Override
    @Transactional
    public ApiResponse<AiAnalizResponse> butceOnerisiAl(Long kullaniciId) {
        Kullanici kullanici = kullaniciGetir(kullaniciId);
        planKontrolEt(kullanici, PlanTuru.PREMIUM, "Bütçe önerisi");

        Optional<AiAnalizSonucu> onbellekSonucu = analizSonucuRepository.findGecerliAnalizAysiz(
                kullaniciId, AnalizTuru.BUTCE_ONERISI, LocalDateTime.now()
        );

        if (onbellekSonucu.isPresent()) {
            return ApiResponse.basarili(jsondenResponse(onbellekSonucu.get(), true));
        }

        LocalDate ucAyOnce = LocalDate.now().minusMonths(3);
        List<Gider> giderler = giderRepository.findSon3AyGiderler(kullaniciId, ucAyOnce);

        if (giderler.isEmpty()) {
            AiAnalizResponse bos = new AiAnalizResponse(
                    AnalizTuru.BUTCE_ONERISI,
                    "Bütçe önerisi oluşturmak için yeterli harcama geçmişi bulunamadı.",
                    List.of("En az 1 aylık harcama verisi gereklidir."),
                    List.of("Harcamalarınızı düzenli olarak kayıt etmeye devam edin."),
                    "Harcama kaydı oluşturmaya başlayın",
                    LocalDateTime.now(),
                    false
            );
            return ApiResponse.basarili(bos);
        }

        String harcamaOzeti = harcamaVerisiniHazirla(giderler,
                LocalDate.now().getMonthValue(), LocalDate.now().getYear());

        String sistemPrompt = """
                Sen kişisel finans konusunda uzman bir bütçe danışmanısın.
                Türk kullanıcıların harcama alışkanlıklarını analiz ederek gerçekçi ve sürdürülebilir bütçe önerileri sunarsın.
                Tüm yanıtların Türkçe olacak.
                Yanıtlarını MUTLAKA aşağıdaki JSON formatında ver:
                {
                  "ozet": "Genel bütçe değerlendirmesi ve önerilerin özeti",
                  "bulgular": ["Kategori bazlı ortalama harcama tespitleri"],
                  "oneriler": ["Kategori bazlı önerilen bütçe miktarları ve gerekçeleri"],
                  "oncelikliEylem": "İlk yapılması gereken bütçe düzenlemesi"
                }
                """;

        String kullaniciMesaji = String.format("""
                Son 3 aylık harcama geçmişime dayanarak bana aylık bütçe önerileri hazırla:

                %s

                Lütfen:
                1. Her kategori için makul aylık bütçe limitleri öner (TL cinsinden)
                2. 50/30/20 bütçe kuralını göz önünde bulundur (ihtiyaçlar/istekler/tasarruf)
                3. Türkiye ekonomik koşullarını dikkate al
                4. Önerilerin gerçekçi ve sürdürülebilir olmasına dikkat et
                """, harcamaOzeti);

        AiAnalizResponse analizResponse = openAiAnalizCagir(kullaniciMesaji, sistemPrompt, AnalizTuru.BUTCE_ONERISI);
        sonucuKaydet(kullanici, AnalizTuru.BUTCE_ONERISI, null, null, analizResponse);

        return ApiResponse.basarili(analizResponse);
    }

    @Override
    @Transactional
    public ApiResponse<AiAnalizResponse> anomaliTespitEt(Long kullaniciId) {
        Kullanici kullanici = kullaniciGetir(kullaniciId);
        planKontrolEt(kullanici, PlanTuru.ULTRA, "Anomali tespiti");

        Optional<AiAnalizSonucu> onbellekSonucu = analizSonucuRepository.findGecerliAnalizAysiz(
                kullaniciId, AnalizTuru.ANOMALI_TESPITI, LocalDateTime.now()
        );

        if (onbellekSonucu.isPresent()) {
            return ApiResponse.basarili(jsondenResponse(onbellekSonucu.get(), true));
        }

        LocalDate ucAyOnce = LocalDate.now().minusMonths(3);
        List<Gider> giderler = giderRepository.findSon3AyGiderler(kullaniciId, ucAyOnce);

        if (giderler.isEmpty()) {
            AiAnalizResponse bos = new AiAnalizResponse(
                    AnalizTuru.ANOMALI_TESPITI,
                    "Anomali tespiti için yeterli harcama verisi bulunamadı.",
                    List.of("Yeterli harcama geçmişi mevcut değil."),
                    List.of("Daha fazla harcama kaydı oluşturun."),
                    "Harcamalarınızı kayıt etmeye devam edin",
                    LocalDateTime.now(),
                    false
            );
            return ApiResponse.basarili(bos);
        }

        String harcamaOzeti = harcamaVerisiniHazirla(giderler,
                LocalDate.now().getMonthValue(), LocalDate.now().getYear());

        String sistemPrompt = """
                Sen finansal anomali tespiti konusunda uzman bir yapay zeka asistanısın.
                Kullanıcının harcama paternlerini inceleyerek olağandışı, beklenmedik veya şüpheli harcamaları tespit edersin.
                Tüm yanıtların Türkçe olacak.
                Yanıtlarını MUTLAKA aşağıdaki JSON formatında ver:
                {
                  "ozet": "Genel anomali değerlendirmesi",
                  "bulgular": ["Tespit edilen anomaliler ve olağandışı paternler"],
                  "oneriler": ["Her anomali için açıklama ve öneri"],
                  "oncelikliEylem": "Dikkat edilmesi gereken en kritik anomali"
                }
                """;

        String kullaniciMesaji = String.format("""
                Aşağıdaki harcama verilerimi inceleyerek olağandışı veya anomali teşkil eden harcamaları tespit et:

                %s

                Lütfen:
                1. Normalden yüksek harcamaları belirle
                2. Beklenmedik kategori harcamalarını tespit et
                3. Tekrarlayan gereksiz harcamaları bul
                4. Her anomali için açıklama ve ne yapılması gerektiğini belirt
                """, harcamaOzeti);

        AiAnalizResponse analizResponse = openAiAnalizCagir(kullaniciMesaji, sistemPrompt, AnalizTuru.ANOMALI_TESPITI);
        sonucuKaydet(kullanici, AnalizTuru.ANOMALI_TESPITI, null, null, analizResponse);

        return ApiResponse.basarili(analizResponse);
    }

    @Override
    @Transactional
    public ApiResponse<AiAnalizResponse> tasarrufFirsatlariniGoster(Long kullaniciId) {
        Kullanici kullanici = kullaniciGetir(kullaniciId);
        planKontrolEt(kullanici, PlanTuru.ULTRA, "Tasarruf fırsatları analizi");

        Optional<AiAnalizSonucu> onbellekSonucu = analizSonucuRepository.findGecerliAnalizAysiz(
                kullaniciId, AnalizTuru.TASARRUF_FIRSATI, LocalDateTime.now()
        );

        if (onbellekSonucu.isPresent()) {
            return ApiResponse.basarili(jsondenResponse(onbellekSonucu.get(), true));
        }

        LocalDate ucAyOnce = LocalDate.now().minusMonths(3);
        List<Gider> giderler = giderRepository.findSon3AyGiderler(kullaniciId, ucAyOnce);

        if (giderler.isEmpty()) {
            AiAnalizResponse bos = new AiAnalizResponse(
                    AnalizTuru.TASARRUF_FIRSATI,
                    "Tasarruf analizi için yeterli veri bulunamadı.",
                    List.of("Yeterli harcama geçmişi mevcut değil."),
                    List.of("En az 1 aylık harcama verisi gereklidir."),
                    "Harcamalarınızı kayıt etmeye başlayın",
                    LocalDateTime.now(),
                    false
            );
            return ApiResponse.basarili(bos);
        }

        String harcamaOzeti = harcamaVerisiniHazirla(giderler,
                LocalDate.now().getMonthValue(), LocalDate.now().getYear());

        String sistemPrompt = """
                Sen kişisel finans tasarrufu konusunda uzman bir danışmansın.
                Türk tüketicilerin harcama alışkanlıklarını analiz ederek somut tasarruf fırsatları sunan öneriler hazırlarsın.
                Türkiye'deki fırsatları (indirim uygulamaları, alternatif markalar, mevsimsel kampanyalar vb.) bilirsin.
                Tüm yanıtların Türkçe olacak.
                Yanıtlarını MUTLAKA aşağıdaki JSON formatında ver:
                {
                  "ozet": "Toplam tasarruf potansiyeli ve genel değerlendirme",
                  "bulgular": ["Tasarruf yapılabilecek alanlar ve tahmini miktarlar"],
                  "oneriler": ["Somut tasarruf önerileri ve pratik ipuçları"],
                  "oncelikliEylem": "En yüksek tasarrufu sağlayacak hemen yapılabilecek eylem"
                }
                """;

        String kullaniciMesaji = String.format("""
                Harcama verilerimi analiz ederek tasarruf fırsatlarını belirle:

                %s

                Lütfen:
                1. Her kategoride ne kadar tasarruf yapabileceğimi hesapla
                2. Türkiye'deki alternatif ve daha uygun seçenekler öner
                3. Abonelik ve sabit giderleri optimize etme yollarını göster
                4. Kısa vadeli ve uzun vadeli tasarruf stratejileri sun
                5. Tasarruf hedefleri ve zaman çizelgesi öner
                """, harcamaOzeti);

        AiAnalizResponse analizResponse = openAiAnalizCagir(kullaniciMesaji, sistemPrompt, AnalizTuru.TASARRUF_FIRSATI);
        sonucuKaydet(kullanici, AnalizTuru.TASARRUF_FIRSATI, null, null, analizResponse);

        return ApiResponse.basarili(analizResponse);
    }

    // ========== Yardımcı Metodlar ==========

    private AiAnalizResponse openAiAnalizCagir(String kullaniciMesaji, String sistemPrompt, AnalizTuru tur) {
        HttpHeaders basliklar = new HttpHeaders();
        basliklar.setContentType(MediaType.APPLICATION_JSON);
        basliklar.setBearerAuth(openAiConfig.getApiAnahtari());

        List<Map<String, String>> mesajlar = List.of(
                Map.of("role", "system", "content", sistemPrompt),
                Map.of("role", "user", "content", kullaniciMesaji)
        );

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
                throw new RuntimeException("OpenAI API boş yanıt döndü.");
            }

            return yanitParseEt(yanitGovdesi, tur);

        } catch (Exception e) {
            log.error("OpenAI API çağrısı başarısız: {}", e.getMessage());
            throw new RuntimeException("Yapay zeka servisi şu an kullanılamıyor. Lütfen daha sonra tekrar deneyin.");
        }
    }

    private AiAnalizResponse yanitParseEt(String yanitJson, AnalizTuru tur) {
        try {
            JsonNode kok = objectMapper.readTree(yanitJson);
            String metin = kok.path("choices").get(0).path("message").path("content").asText();

            if (metin.contains("```json")) {
                metin = metin.substring(metin.indexOf("```json") + 7);
                metin = metin.substring(0, metin.indexOf("```")).trim();
            } else if (metin.contains("```")) {
                metin = metin.substring(metin.indexOf("```") + 3);
                metin = metin.substring(0, metin.indexOf("```")).trim();
            }

            JsonNode analizNode = objectMapper.readTree(metin);

            String ozet = analizNode.path("ozet").asText("Analiz tamamlandı.");
            List<String> bulgular = objectMapper.convertValue(
                    analizNode.path("bulgular"), new TypeReference<List<String>>() {}
            );
            List<String> oneriler = objectMapper.convertValue(
                    analizNode.path("oneriler"), new TypeReference<List<String>>() {}
            );
            String oncelikliEylem = analizNode.path("oncelikliEylem").asText("");

            return new AiAnalizResponse(tur, ozet, bulgular, oneriler, oncelikliEylem, LocalDateTime.now(), false);

        } catch (Exception e) {
            log.error("AI yanıtı parse edilemedi: {}", e.getMessage());
            return new AiAnalizResponse(
                    tur,
                    "Analiz tamamlandı ancak sonuç işlenirken sorun oluştu.",
                    List.of("Lütfen daha sonra tekrar deneyin."),
                    List.of(),
                    "",
                    LocalDateTime.now(),
                    false
            );
        }
    }

    private String harcamaVerisiniHazirla(List<Gider> giderler, int ay, int yil) {
        Map<String, List<Gider>> kategoriGrubu = giderler.stream()
                .collect(Collectors.groupingBy(g -> g.getKategori().getAd()));

        StringBuilder sb = new StringBuilder();
        sb.append(String.format("=== %d/%d Harcama Özeti ===\n", ay, yil));
        sb.append(String.format("Toplam kayıt: %d\n\n", giderler.size()));

        sb.append("Kategori Bazlı Toplamlar:\n");
        kategoriGrubu.forEach((kategoriAd, kategoriGiderler) -> {
            double toplam = kategoriGiderler.stream()
                    .mapToDouble(g -> g.getTutar().doubleValue())
                    .sum();
            sb.append(String.format("- %s: %.2f TL (%d işlem)\n",
                    kategoriAd, toplam, kategoriGiderler.size()));
        });

        sb.append("\nSon 10 Harcama:\n");
        giderler.stream().limit(10).forEach(g ->
                sb.append(String.format("- %s | %s | %.2f TL | %s\n",
                        g.getTarih(), g.getKategori().getAd(),
                        g.getTutar().doubleValue(),
                        g.getAciklama() != null ? g.getAciklama() : ""))
        );

        return sb.toString();
    }

    private void sonucuKaydet(Kullanici kullanici, AnalizTuru tur, Integer ay, Integer yil,
                               AiAnalizResponse analizResponse) {
        try {
            String json = objectMapper.writeValueAsString(Map.of(
                    "ozet", analizResponse.ozet(),
                    "bulgular", analizResponse.bulgular(),
                    "oneriler", analizResponse.oneriler(),
                    "oncelikliEylem", analizResponse.oncelikliEylem()
            ));

            AiAnalizSonucu sonuc = AiAnalizSonucu.builder()
                    .kullanici(kullanici)
                    .tur(tur)
                    .ay(ay)
                    .yil(yil)
                    .icerikJson(json)
                    .gecerlilikSuresi(LocalDateTime.now().plusHours(ONBELLEK_SAAT))
                    .build();

            analizSonucuRepository.save(sonuc);
        } catch (Exception e) {
            log.warn("Analiz sonucu kaydedilemedi: {}", e.getMessage());
        }
    }

    private AiAnalizResponse jsondenResponse(AiAnalizSonucu sonuc, boolean onbellekten) {
        try {
            JsonNode node = objectMapper.readTree(sonuc.getIcerikJson());
            String ozet = node.path("ozet").asText();
            List<String> bulgular = objectMapper.convertValue(
                    node.path("bulgular"), new TypeReference<List<String>>() {}
            );
            List<String> oneriler = objectMapper.convertValue(
                    node.path("oneriler"), new TypeReference<List<String>>() {}
            );
            String oncelikliEylem = node.path("oncelikliEylem").asText();

            return new AiAnalizResponse(sonuc.getTur(), ozet, bulgular, oneriler, oncelikliEylem,
                    sonuc.getCreatedAt(), onbellekten);
        } catch (Exception e) {
            log.error("Önbellek sonucu parse edilemedi: {}", e.getMessage());
            throw new RuntimeException("Analiz sonucu okunamadı.");
        }
    }

    private Kullanici kullaniciGetir(Long kullaniciId) {
        return kullaniciRepository.findById(kullaniciId)
                .orElseThrow(() -> new KayitBulunamadiException("Kullanıcı bulunamadı."));
    }

    private void planKontrolEt(Kullanici kullanici, PlanTuru gerekliFPlan, String ozellik) {
        if (gerekliFPlan == PlanTuru.ULTRA && kullanici.getPlan() != PlanTuru.ULTRA) {
            throw new PlanLimitiAsimException(
                    ozellik + " özelliği yalnızca ULTRA plan kullanıcılarına sunulmaktadır. " +
                    "Planınızı yükselterek bu özelliğe erişebilirsiniz."
            );
        }
        if (gerekliFPlan == PlanTuru.PREMIUM &&
                kullanici.getPlan() == PlanTuru.FREE) {
            throw new PlanLimitiAsimException(
                    ozellik + " özelliği yalnızca PREMIUM ve ULTRA plan kullanıcılarına sunulmaktadır. " +
                    "Planınızı yükselterek bu özelliğe erişebilirsiniz."
            );
        }
    }
}
