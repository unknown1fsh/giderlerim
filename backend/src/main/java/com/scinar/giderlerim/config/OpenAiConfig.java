package com.scinar.giderlerim.config;

import com.scinar.giderlerim.service.SistemParametresiDegerService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

@Configuration
@RequiredArgsConstructor
public class OpenAiConfig {

    private final SistemParametresiDegerService parametreler;

    @Value("${openai.api.key}")
    private String apiAnahtari;

    @Value("${openai.model}")
    private String varsayilanModel;

    @Value("${openai.max-tokens}")
    private int varsayilanMaxTokens;

    public String getApiAnahtari() {
        return apiAnahtari;
    }

    public String getModel() {
        return parametreler.metin("openai.model", varsayilanModel);
    }

    public int getMaxTokens() {
        return parametreler.pozitifTamSayi("openai.max-tokens", varsayilanMaxTokens);
    }

    @Bean
    public RestTemplate restTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(30000);
        factory.setReadTimeout(120000);
        return new RestTemplate(factory);
    }
}
