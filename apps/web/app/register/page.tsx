import {
  redirect,
} from "next/navigation";

import {
  RegisterPageContent,
} from "@/components/auth/register-page-content";
import {
  getCurrentUser,
} from "@/lib/server-auth";


export default async function RegisterPage() {
  const user =
    await getCurrentUser();

  if (user) {
    redirect(
      "/dashboard",
    );
  }

  return (
    <RegisterPageContent />
  );
}
