package com.scinar.giderlerim;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.scinar.giderlerim.entity.HesapToken;
import com.scinar.giderlerim.entity.Kullanici;
import com.scinar.giderlerim.entity.enums.HesapTokenTuru;
import com.scinar.giderlerim.repository.HesapTokenRepository;
import com.scinar.giderlerim.repository.KullaniciRepository;
import com.scinar.giderlerim.util.HesapTokenGuvenligi;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Gerçek PostgreSQL üzerinde: yeni kayıt → kısıtlı özellik 403 → e-posta doğrulama → kısıt kalkar.
 * {@code MIGRASYON_TEST_DB_URL} tanımlıysa (CI) çalışır. E-posta servisi kapalıdır; kayıt yine başarılı olmalıdır.
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
class HesapDogrulamaEntegrasyonTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired KullaniciRepository kullaniciRepository;
    @Autowired HesapTokenRepository tokenRepository;

    @Test
    void yeniHesapDogrulanincaYuklemeKilidiKalkar() throws Exception {
        String email = "dogrulama-" + UUID.randomUUID() + "@ornek.com";
        String kayitGovdesi = objectMapper.writeValueAsString(java.util.Map.of(
                "ad", "Yeni", "soyad", "Kullanıcı", "email", email, "sifre", "GucluSifre1!"));

        String kayitYaniti = mockMvc.perform(post("/api/v1/auth/kayit")
                        .contentType(MediaType.APPLICATION_JSON).content(kayitGovdesi))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);
        String accessToken = objectMapper.readTree(kayitYaniti).path("data").path("accessToken").asText();
        String bearer = "Bearer " + accessToken;

        mockMvc.perform(get("/api/v1/kullanici/profil").header("Authorization", bearer))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.emailDogrulandi").value(false))
                .andExpect(jsonPath("$.data.emailDogrulamaGerekli").value(true));

        MockMultipartFile csv = new MockMultipartFile("dosya", "giderler.csv", "text/csv",
                "tarih,tutar\n07.11.2026,10\n".getBytes(StandardCharsets.UTF_8));
        mockMvc.perform(multipart("/api/v1/csv/yukle").file(csv).header("Authorization", bearer))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.hataKodu").value("EMAIL_DOGRULAMA_GEREKLI"));

        // E-posta kapalı olduğu için bağlantı gönderilemez; kullanıcının alacağı tokenı doğrudan oluştur.
        Kullanici kullanici = kullaniciRepository.findByEmailAndDeletedAtIsNull(email).orElseThrow();
        String hamToken = HesapTokenGuvenligi.yeniToken();
        tokenRepository.save(HesapToken.builder()
                .kullanici(kullanici)
                .tur(HesapTokenTuru.EMAIL_DOGRULAMA)
                .tokenHash(HesapTokenGuvenligi.hash(hamToken))
                .sonKullanmaTarihi(LocalDateTime.now().plusMinutes(30))
                .build());

        mockMvc.perform(post("/api/v1/auth/email-dogrula")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"token\":\"" + hamToken + "\"}"))
                .andExpect(status().isOk());

        JsonNode profil = objectMapper.readTree(mockMvc.perform(get("/api/v1/kullanici/profil").header("Authorization", bearer))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8));
        assertThat(profil.path("data").path("emailDogrulandi").asBoolean()).isTrue();
        assertThat(profil.path("data").path("emailDogrulamaGerekli").asBoolean()).isFalse();

        // Kilit kalktı: ücretsiz planın aylık 1 CSV hakkıyla yükleme kabul edilir.
        mockMvc.perform(multipart("/api/v1/csv/yukle").file(csv).header("Authorization", bearer))
                .andExpect(status().isCreated());

        // Aynı token ikinci kez kullanılamaz.
        mockMvc.perform(post("/api/v1/auth/email-dogrula")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"token\":\"" + hamToken + "\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void mevcutHesapDogrulanmamisOlsaDaKisitlanmaz() throws Exception {
        Kullanici eski = kullaniciRepository.save(Kullanici.builder()
                .ad("Eski").soyad("Kullanıcı").email("eski-" + UUID.randomUUID() + "@ornek.com")
                .sifreHash("x").emailDogrulandi(false).build());

        assertThat(eski.getEmailDogrulamaZorunlu()).isFalse();
        assertThat(com.scinar.giderlerim.util.EmailDogrulamaKapisi.dogrulamaBekleniyor(eski)).isFalse();
    }
}
