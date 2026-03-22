package com.scinar.giderlerim.entity;

import com.scinar.giderlerim.entity.enums.ParaBirimi;
import com.scinar.giderlerim.entity.enums.PlanTuru;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "kullanicilar")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Kullanici implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String ad;

    @Column(nullable = false, length = 100)
    private String soyad;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "sifre_hash", nullable = false, length = 255)
    private String sifreHash;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "plan_turu", nullable = false)
    @Builder.Default
    private PlanTuru plan = PlanTuru.FREE;

    @Enumerated(EnumType.STRING)
    @Column(name = "para_birimi", columnDefinition = "para_birimi", nullable = false)
    @Builder.Default
    private ParaBirimi paraBirimi = ParaBirimi.TRY;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Column(nullable = false)
    @Builder.Default
    private Boolean aktif = true;

    @Column(name = "email_dogrulandi", nullable = false)
    @Builder.Default
    private Boolean emailDogrulandi = false;

    @Column(name = "son_giris_tarihi")
    private LocalDateTime sonGirisTarihi;

    @Column(name = "admin_mi", nullable = false)
    @Builder.Default
    private Boolean adminMi = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime simdi = LocalDateTime.now();
        this.createdAt = simdi;
        this.updatedAt = simdi;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // UserDetails implementasyonu
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (Boolean.TRUE.equals(adminMi)) {
            return List.of(
                    new SimpleGrantedAuthority("ROLE_ADMIN"),
                    new SimpleGrantedAuthority("ROLE_" + plan.name())
            );
        }
        return List.of(new SimpleGrantedAuthority("ROLE_" + plan.name()));
    }

    @Override
    public String getPassword() {
        return sifreHash;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return Boolean.TRUE.equals(aktif) && deletedAt == null;
    }
}
