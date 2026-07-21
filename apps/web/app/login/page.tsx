import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { Logo } from "@/components/layout/logo";
import { getCurrentUser } from "@/lib/server-auth";

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="auth-page">
      <section className="auth-side-panel">
        <Logo />

        <div className="auth-side-content">
          <p className="eyebrow">Welcome back</p>
          <h1>Your wellbeing tools, all in one place.</h1>
          <p>
            Plan your day, manage difficult moments and
            build routines that work with your brain.
          </p>
        </div>

        <p className="side-note">
          Designed for different minds, needs and ways of
          working.
        </p>
      </section>

      <section className="auth-form-panel">
        <div className="auth-card">
          <p className="eyebrow">Aksess account</p>
          <h2>Sign in</h2>
          <p className="auth-description">
            Enter your account details to continue.
          </p>

          <LoginForm />
        </div>
      </section>
    </main>
  );
}
