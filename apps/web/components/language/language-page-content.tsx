"use client";

import Link from "next/link";

import { phase2Text } from "@/components/i18n/phase2-translations";
import { LanguageReadingManager } from "@/components/language/language-reading-manager";
import { useLanguage } from "@/components/language/language-provider";
import { Logo } from "@/components/layout/logo";

export function LanguagePageContent() {
  const { locale } = useLanguage();

  const t = (key: string) =>
    phase2Text(locale, key);

  return (
    <main className="language-page">
      <header className="tasks-header">
        <Logo />

        <Link
          className="button button-secondary"
          href="/dashboard"
        >
          {t("common.back")}
        </Link>
      </header>

      <section className="language-page-heading">
        <p className="eyebrow">
          {t("language.eyebrow")}
        </p>

        <h1>
          {t("language.title")}
        </h1>

        <p>
          {t("language.description")}
        </p>
      </section>

      <LanguageReadingManager />
    </main>
  );
}
