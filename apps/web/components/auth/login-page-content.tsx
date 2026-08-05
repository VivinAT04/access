"use client";

import {
  LoginForm,
} from "@/components/auth/login-form";
import {
  authText,
} from "@/components/i18n/auth-translations";
import {
  useLanguage,
} from "@/components/language/language-provider";
import {
  Logo,
} from "@/components/layout/logo";


export function LoginPageContent() {
  const { locale } =
    useLanguage();

  const text = (
    key:
      Parameters<
        typeof authText
      >[1],
  ) => authText(
    locale,
    key,
  );

  return (
    <main className="auth-page">
      <section className="auth-side-panel">
        <Logo />

        <div className="auth-side-content">
          <p className="eyebrow">
            {text(
              "login.welcomeBack",
            )}
          </p>

          <h1>
            {text(
              "login.heroTitle",
            )}
          </h1>

          <p>
            {text(
              "login.heroDescription",
            )}
          </p>
        </div>

        <p className="side-note">
          {text(
            "login.sideNote",
          )}
        </p>
      </section>

      <section className="auth-form-panel">
        <div className="auth-card">
          <p className="eyebrow">
            {text(
              "login.account",
            )}
          </p>

          <h2>
            {text(
              "login.title",
            )}
          </h2>

          <p className="auth-description">
            {text(
              "login.description",
            )}
          </p>

          <LoginForm />
        </div>
      </section>
    </main>
  );
}
