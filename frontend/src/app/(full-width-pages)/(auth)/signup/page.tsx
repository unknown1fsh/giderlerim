import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kayıt ol",
  description: "Giderlerim'e ücretsiz kayıt olun — www.giderlerim.net",
};

export default function SignUp() {
  return <SignUpForm />;
}
