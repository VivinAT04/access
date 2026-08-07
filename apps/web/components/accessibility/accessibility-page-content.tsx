"use client";

import Link from "next/link";

import { AccessibilityForm } from "@/components/accessibility/accessibility-form";
import { phase2Text } from "@/components/i18n/phase2-translations";
import { useLanguage } from "@/components/language/language-provider";
import { Logo } from "@/components/layout/logo";
import { ThemeSelector } from "@/components/theme/theme-selector";

export function AccessibilityPageContent() {
  const { locale } = useLanguage();

  const t = (key: string) =>
    phase2Text(locale, key);

  return (
    <main className="settings-page">
      <header className="settings-header">
        <Logo />

        <nav
          aria-label={t(
            "accessibility.navigation",
          )}
        >
          <Link
            className="button button-secondary"
            href="/dashboard"
          >
            {t("common.back")}
          </Link>
        </nav>
      </header>

      <section className="settings-heading">
        <p className="eyebrow">
          {t("accessibility.eyebrow")}
        </p>

        <h1>
          {t("accessibility.title")}
        </h1>

        <p>
          {t("accessibility.description")}
        </p>
      </section>

      <ThemeSelector />
      <AccessibilityForm />
    </main>
  );
}
