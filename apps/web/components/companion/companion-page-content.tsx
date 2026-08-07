"use client";

import Link from "next/link";

import { CompanionManager } from "@/components/companion/companion-manager";
import { phase2Text } from "@/components/i18n/phase2-translations";
import { useLanguage } from "@/components/language/language-provider";
import { Logo } from "@/components/layout/logo";

export function CompanionPageContent() {
  const { locale } = useLanguage();

  const t = (
    key: string,
    values: Record<string, string | number> = {},
  ) => phase2Text(locale, key, values);

  return (
    <main className="companion-page">
      <header className="tasks-header">
        <Logo />

        <Link
          className="button button-secondary"
          href="/dashboard"
        >
          {t("common.back")}
        </Link>
      </header>

      <section className="companion-page-heading">
        <p className="eyebrow">
          {t("companion.eyebrow")}
        </p>

        <h1>
          {t("companion.pageTitle")}
        </h1>

        <p>
          {t("companion.pageDescription")}
        </p>
      </section>

      <CompanionManager />
    </main>
  );
}
