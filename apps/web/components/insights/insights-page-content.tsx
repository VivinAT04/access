"use client";

import Link from "next/link";

import { phase2Text } from "@/components/i18n/phase2-translations";
import { InsightsDashboard } from "@/components/insights/insights-dashboard";
import { useLanguage } from "@/components/language/language-provider";
import { Logo } from "@/components/layout/logo";

export function InsightsPageContent() {
  const { locale } = useLanguage();

  const t = (key: string) =>
    phase2Text(locale, key);

  return (
    <main className="insights-page">
      <header className="tasks-header">
        <Logo />

        <Link
          className="button button-secondary"
          href="/dashboard"
        >
          {t("common.back")}
        </Link>
      </header>

      <section className="insights-page-heading">
        <p className="eyebrow">
          {t("insights.eyebrow")}
        </p>

        <h1>
          {t("insights.pageTitle")}
        </h1>

        <p>
          {t("insights.pageDescription")}
        </p>
      </section>

      <InsightsDashboard />
    </main>
  );
}
