package com.scinar.giderlerim;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Gerçek PostgreSQL üzerinde tüm Flyway migration'larını boş şemaya uygular ve
 * {@code spring.jpa.hibernate.ddl-auto=validate} ile entity eşlemesini doğrular.
 * CI'da PostgreSQL servisiyle çalışır; yerelde {@code MIGRASYON_TEST_DB_URL} tanımlıysa çalışır.
 */
@EnabledIfEnvironmentVariable(named = "MIGRASYON_TEST_DB_URL", matches = ".+")
@SpringBootTest(properties = {
        "spring.datasource.url=${MIGRASYON_TEST_DB_URL}",
        "spring.datasource.username=${MIGRASYON_TEST_DB_USER:postgres}",
        "spring.datasource.password=${MIGRASYON_TEST_DB_PASSWORD:postgres}",
        "jwt.secret=migrasyon-testi-icin-en-az-otuz-iki-baytlik-gizli-anahtar-degeri",
        "app.mail.enabled=false"
})
class FlywayMigrasyonDogrulamaTest {

    @Autowired
    Flyway flyway;

    @Test
    void tumMigrationlarUygulanirVeEntityEslesmesiDogrulanir() {
        // Context yüklenmesi: Flyway migrate + Hibernate şema doğrulaması başarılı demektir.
        assertThat(flyway.info().pending()).isEmpty();
        assertThat(flyway.info().applied()).isNotEmpty();
        assertThat(flyway.validateWithResult().validationSuccessful).isTrue();
    }
}
