import { redirect } from "next/navigation";

import { RegisterForm } from "@/components/auth/register-form";
import { Logo } from "@/components/layout/logo";
import { getCurrentUser } from "@/lib/server-auth";

export default async function RegisterPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="auth-page">
      <section className="auth-side-panel">
        <Logo />

        <div className="auth-side-content">
          <p className="eyebrow">Start with Aksess</p>
          <h1>Support that adapts to you.</h1>
          <p>
            Create a calm, accessible space for planning,
            focus, reflection and everyday wellbeing.
          </p>
        </div>

        <p className="side-note">
          You control how Aksess looks, feels and supports
          you.
        </p>
      </section>

      <section className="auth-form-panel">
        <div className="auth-card">
          <p className="eyebrow">Create your space</p>
          <h2>Create an account</h2>
          <p className="auth-description">
            Set up your account to begin personalising your
            experience.
          </p>

          <RegisterForm />
        </div>
      </section>
    </main>
  );
}
