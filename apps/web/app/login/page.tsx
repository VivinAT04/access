import {
  redirect,
} from "next/navigation";

import {
  LoginPageContent,
} from "@/components/auth/login-page-content";
import {
  getCurrentUser,
} from "@/lib/server-auth";


export default async function LoginPage() {
  const user =
    await getCurrentUser();

  if (user) {
    redirect(
      "/dashboard",
    );
  }

  return (
    <LoginPageContent />
  );
}
