"use client";

import Link from "next/link";

import {
  sensoryText,
} from "@/components/i18n/sensory-translations";
import {
  useLanguage,
} from "@/components/language/language-provider";
import {
  Logo,
} from "@/components/layout/logo";
import {
  SensoryManager,
} from "@/components/sensory/sensory-manager";


export function SensoryPageContent() {
  const { locale } =
    useLanguage();

  const text = (
    key: string,
    values: Record<
      string,
      string | number
    > = {},
  ) =>
    sensoryText(
      locale,
      key,
      values,
    );

  return (
    <main className="sensory-page">
      <header className="tasks-header">
        <Logo />

        <Link
          className="button button-secondary"
          href="/dashboard"
        >
          {text(
            "backDashboard",
          )}
        </Link>
      </header>

      <section className="sensory-page-heading">
        <p className="eyebrow">
          {text(
            "page.eyebrow",
          )}
        </p>

        <h1>
          {text(
            "page.title",
          )}
        </h1>

        <p>
          {text(
            "page.description",
          )}
        </p>
      </section>

      <SensoryManager />
    </main>
  );
}
