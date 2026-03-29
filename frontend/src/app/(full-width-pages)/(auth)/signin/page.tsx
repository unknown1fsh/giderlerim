import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Giriş Yap | Giderlerim",
  description: "Giderlerim uygulamasına giriş yapın.",
};

export default function SignIn() {
  return <SignInForm />;
}
