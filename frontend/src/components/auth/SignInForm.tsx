"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/stores/authStore";
import { isKullaniciProfilCevabi } from "@/lib/authProfile";

export default function SignInForm() {
  const router = useRouter();
  const { girisYap } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authService.girisYap({ email, sifre: password });
      const tokens = res.data;
      if (!tokens?.accessToken || !tokens.refreshToken) {
        setError("Giriş yanıtı geçersiz.");
        return;
      }
      const apiKok = process.env.NEXT_PUBLIC_API_URL || "";
      const profilHttp = await fetch(`${apiKok}/api/v1/kullanici/profil`, {
        headers: { Authorization: `Bearer ${tokens.accessToken}` },
      });
      let profilGovde: unknown;
      try {
        profilGovde = await profilHttp.json();
      } catch {
        setError("Profil bilgisi okunamadı.");
        return;
      }
      if (!profilHttp.ok || !isKullaniciProfilCevabi(profilGovde)) {
        setError("Profil bilgisi alınamadı. Lütfen tekrar deneyin.");
        return;
      }
      girisYap(tokens.accessToken, tokens.refreshToken, profilGovde.data);
      router.push("/dashboard");
    } catch {
      setError("E-posta veya şifre hatalı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Giriş Yap
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              E-posta ve şifrenizle giriş yapın
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <Label>E-posta <span className="text-error-500">*</span></Label>
                <Input
                  placeholder="ornek@email.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Label>Şifre <span className="text-error-500">*</span></Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Şifrenizi girin"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                  >
                    {showPassword ? (
                      <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                    ) : (
                      <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                    )}
                  </span>
                </div>
              </div>
              {error && (
                <p className="text-sm text-error-500">{error}</p>
              )}
              <div>
                <Button className="w-full" size="sm" disabled={loading}>
                  {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
                </Button>
              </div>
            </div>
          </form>
          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
              Hesabınız yok mu?{" "}
              <Link
                href="/signup"
                className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Kayıt Ol
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
