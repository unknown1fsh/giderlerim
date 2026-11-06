package com.scinar.giderlerim.service;

import com.scinar.giderlerim.repository.SistemParametresiRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SistemParametresiDegerService {

    private final SistemParametresiRepository repository;

    public String metin(String anahtar, String varsayilan) {
        return repository.findByAnahtar(anahtar)
                .map(parametre -> parametre.getDeger().trim())
                .filter(deger -> !deger.isEmpty())
                .orElse(varsayilan);
    }

    public int pozitifTamSayi(String anahtar, int varsayilan) {
        try {
            int deger = Integer.parseInt(metin(anahtar, Integer.toString(varsayilan)));
            return deger > 0 ? deger : varsayilan;
        } catch (NumberFormatException ignored) {
            return varsayilan;
        }
    }

    public long pozitifLong(String anahtar, long varsayilan) {
        try {
            long deger = Long.parseLong(metin(anahtar, Long.toString(varsayilan)));
            return deger > 0 ? deger : varsayilan;
        } catch (NumberFormatException ignored) {
            return varsayilan;
        }
    }

    public int tamSayi(String anahtar, int varsayilan) {
        try {
            return Integer.parseInt(metin(anahtar, Integer.toString(varsayilan)));
        } catch (NumberFormatException ignored) {
            return varsayilan;
        }
    }

    public boolean mantiksal(String anahtar, boolean varsayilan) {
        String deger = metin(anahtar, Boolean.toString(varsayilan));
        if ("true".equalsIgnoreCase(deger)) return true;
        if ("false".equalsIgnoreCase(deger)) return false;
        return varsayilan;
    }
}
