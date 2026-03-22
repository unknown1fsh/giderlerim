package com.scinar.giderlerim.service;

import com.scinar.giderlerim.dto.response.ApiResponse;
import com.scinar.giderlerim.dto.response.DashboardResponse;
import com.scinar.giderlerim.dto.response.GunlukHarcamaResponse;
import com.scinar.giderlerim.dto.response.KategoriHarcamaResponse;

import java.time.LocalDate;
import java.util.List;

public interface DashboardService {
    ApiResponse<DashboardResponse> getDashboard(Long kullaniciId, int ay, int yil);
    ApiResponse<List<GunlukHarcamaResponse>> getGunlukHarcamalar(Long kullaniciId, LocalDate baslangic, LocalDate bitis);
    ApiResponse<List<KategoriHarcamaResponse>> getKategoriDagilimi(Long kullaniciId, int ay, int yil);
}
