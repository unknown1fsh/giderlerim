import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kayıt Ol | Giderlerim",
  description: "Giderlerim'e ücretsiz kayıt olun.",
};

export default function SignUp() {
  return <SignUpForm />;
}
