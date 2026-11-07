package com.scinar.giderlerim;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.scinar.giderlerim.entity.Kullanici;
import com.scinar.giderlerim.entity.SistemParametresi;
import com.scinar.giderlerim.repository.KullaniciRepository;
import com.scinar.giderlerim.repository.SistemParametresiRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Gerçek PostgreSQL üzerinde ücretsiz plan aylık gider hakkı: tarihi başka aylara yazmak limiti aşmaz,
 * CSV içe aktarma kalan hak kadar satır ekler. {@code MIGRASYON_TEST_DB_URL} tanımlıysa (CI) çalışır.
 */
@EnabledIfEnvironmentVariable(named = "MIGRASYON_TEST_DB_URL", matches = ".+")
@SpringBootTest(properties = {
        "spring.datasource.url=${MIGRASYON_TEST_DB_URL}",
        "spring.datasource.username=${MIGRASYON_TEST_DB_USER:postgres}",
        "spring.datasource.password=${MIGRASYON_TEST_DB_PASSWORD:postgres}",
        "jwt.secret=entegrasyon-testi-icin-en-az-otuz-iki-baytlik-gizli-anahtar",
        "app.mail.enabled=false"
})
@AutoConfigureMockMvc
class PlanKotaEntegrasyonTest {

    private static final String LIMIT_ANAHTARI = "ucretsiz.plan.aylik.gider.limiti";

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired KullaniciRepository kullaniciRepository;
    @Autowired SistemParametresiRepository parametreRepository;
    @Autowired PasswordEncoder passwordEncoder;

    private String eskiLimit;

    @BeforeEach
    void limitiKucult() {
        SistemParametresi p = parametreRepository.findByAnahtar(LIMIT_ANAHTARI).orElseThrow();
        eskiLimit = p.getDeger();
        limitAyarla("2");
    }

    @AfterEach
    void limitiGeriAl() {
        limitAyarla(eskiLimit);
    }

    private void limitAyarla(String deger) {
        SistemParametresi p = parametreRepository.findByAnahtar(LIMIT_ANAHTARI).orElseThrow();
        p.setDeger(deger);
        parametreRepository.save(p);
    }

    private String girisYap() throws Exception {
        String email = "kota-" + UUID.randomUUID() + "@ornek.com";
        kullaniciRepository.save(Kullanici.builder().ad("Kota").soyad("Test").email(email)
                .sifreHash(passwordEncoder.encode("GucluSifre1!")).build());
        String yanit = mockMvc.perform(post("/api/v1/auth/giris").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"sifre\":\"GucluSifre1!\"}"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);
        return "Bearer " + objectMapper.readTree(yanit).path("data").path("accessToken").asText();
    }

    private long kategoriId(String bearer) throws Exception {
        JsonNode kategoriler = objectMapper.readTree(mockMvc.perform(get("/api/v1/kategoriler").header("Authorization", bearer))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8));
        return kategoriler.path("data").get(0).path("id").asLong();
    }

    private String gider(long kategoriId, LocalDate tarih) {
        return "{\"kategoriId\":" + kategoriId + ",\"tutar\":10.00,\"tarih\":\"" + tarih + "\"}";
    }

    @Test
    void tarihiBaskaAylaraYazmakAylikHakkiAsmaz() throws Exception {
        String bearer = girisYap();
        long kategori = kategoriId(bearer);

        mockMvc.perform(post("/api/v1/giderler").header("Authorization", bearer).contentType(MediaType.APPLICATION_JSON)
                .content(gider(kategori, LocalDate.now().minusYears(1)))).andExpect(status().isCreated());
        mockMvc.perform(post("/api/v1/giderler").header("Authorization", bearer).contentType(MediaType.APPLICATION_JSON)
                .content(gider(kategori, LocalDate.now().plusMonths(2)))).andExpect(status().isCreated());

        // Önceden sayaç giderin tarih ayına göre olduğu için bu üçüncü kayıt da kabul ediliyordu.
        mockMvc.perform(post("/api/v1/giderler").header("Authorization", bearer).contentType(MediaType.APPLICATION_JSON)
                        .content(gider(kategori, LocalDate.now().minusMonths(6))))
                .andExpect(status().isPaymentRequired())
                .andExpect(jsonPath("$.hataKodu").value("PLAN_LIMITI_ASIM"));

        // Hak doluyken CSV içe aktarma da reddedilir (CSV hakkı tüketilmez).
        MockMultipartFile csv = new MockMultipartFile("dosya", "giderler.csv", "text/csv",
                "tarih,tutar\n01.01.2025,10\n".getBytes(StandardCharsets.UTF_8));
        mockMvc.perform(multipart("/api/v1/csv/yukle").file(csv).header("Authorization", bearer))
                .andExpect(status().isPaymentRequired());
    }

    @Test
    void csvKalanHakKadarSatirEklerVeKalaniBildirir() throws Exception {
        String bearer = girisYap();
        MockMultipartFile csv = new MockMultipartFile("dosya", "giderler.csv", "text/csv",
                "tarih,tutar,aciklama\n01.10.2026,10,a\n02.10.2026,20,b\n03.10.2026,30,c\n04.10.2026,40,d\n"
                        .getBytes(StandardCharsets.UTF_8));

        mockMvc.perform(multipart("/api/v1/csv/yukle").file(csv).header("Authorization", bearer))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.islenenSatir").value(2))
                .andExpect(jsonPath("$.data.hataMesaji").value(org.hamcrest.Matchers.containsString(
                        "2 satır ücretsiz planın aylık gider hakkı dolduğu için eklenmedi")));
    }
}
