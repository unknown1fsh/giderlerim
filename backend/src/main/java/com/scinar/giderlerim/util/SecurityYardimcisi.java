package com.scinar.giderlerim.util;

import com.scinar.giderlerim.entity.Kullanici;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityYardimcisi {

    private SecurityYardimcisi() {}

    public static Kullanici mevcutKullanici() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("Oturum açık kullanıcı bulunamadı");
        }
        return (Kullanici) authentication.getPrincipal();
    }

    public static Long mevcutKullaniciId() {
        return mevcutKullanici().getId();
    }
}
