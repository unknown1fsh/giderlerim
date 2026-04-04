package com.scinar.giderlerim.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.scinar.giderlerim.dto.request.GirisRequest;
import com.scinar.giderlerim.dto.request.KayitRequest;
import com.scinar.giderlerim.dto.response.ApiResponse;
import com.scinar.giderlerim.dto.response.TokenResponse;
import com.scinar.giderlerim.security.JwtAuthFilter;
import com.scinar.giderlerim.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    @MockBean
    AuthService authService;

    /** SecurityConfig bağımlılığı — slice testinde gerçek filtreyi kurmuyoruz */
    @MockBean
    JwtAuthFilter jwtAuthFilter;

    @Test
    void kayitOl_basarili_201() throws Exception {
        KayitRequest req = new KayitRequest("Ali", "Veli", "ali@test.com", "sifre12345");
        when(authService.kayitOl(any())).thenReturn(ApiResponse.basarili(new TokenResponse("access-x", "refresh-y")));

        mockMvc.perform(post("/api/v1/auth/kayit")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").value("access-x"));
    }

    @Test
    void kayitOl_gecersizBody_400() throws Exception {
        mockMvc.perform(post("/api/v1/auth/kayit")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"ad\":\"\",\"soyad\":\"\",\"email\":\"x\",\"sifre\":\"kisa\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void girisYap_basarili_200() throws Exception {
        when(authService.girisYap(any())).thenReturn(ApiResponse.basarili(new TokenResponse("acc", "ref")));
        GirisRequest req = new GirisRequest("u@test.com", "secret1234");

        mockMvc.perform(post("/api/v1/auth/giris")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken").value("acc"));
    }
}
