import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Giriş yap",
  description: "Giderlerim hesabınıza giriş yapın — giderlerim.net",
};

export default function SignIn() {
  return <SignInForm />;
}
