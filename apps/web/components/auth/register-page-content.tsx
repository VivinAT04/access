"use client";

import {
  RegisterForm,
} from "@/components/auth/register-form";
import {
  authText,
} from "@/components/i18n/auth-translations";
import {
  useLanguage,
} from "@/components/language/language-provider";
import {
  Logo,
} from "@/components/layout/logo";


export function RegisterPageContent() {
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
              "register.start",
            )}
          </p>

          <h1>
            {text(
              "register.heroTitle",
            )}
          </h1>

          <p>
            {text(
              "register.heroDescription",
            )}
          </p>
        </div>

        <p className="side-note">
          {text(
            "register.sideNote",
          )}
        </p>
      </section>

      <section className="auth-form-panel">
        <div className="auth-card">
          <p className="eyebrow">
            {text(
              "register.space",
            )}
          </p>

          <h2>
            {text(
              "register.title",
            )}
          </h2>

          <p className="auth-description">
            {text(
              "register.description",
            )}
          </p>

          <RegisterForm />
        </div>
      </section>
    </main>
  );
}
