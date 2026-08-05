"use client";

import Link from "next/link";

import {
  FocusTimer,
} from "@/components/focus/focus-timer";
import {
  focusText,
} from "@/components/i18n/focus-translations";
import {
  useLanguage,
} from "@/components/language/language-provider";
import {
  Logo,
} from "@/components/layout/logo";


export function FocusPageContent() {
  const { locale } =
    useLanguage();

  const text = (
    key:
      Parameters<
        typeof focusText
      >[1],
  ) => focusText(
    locale,
    key,
  );

  return (
    <main className="focus-page">
      <header className="tasks-header">
        <Logo />

        <Link
          className="button button-secondary"
          href="/dashboard"
        >
          {text(
            "common.backDashboard",
          )}
        </Link>
      </header>

      <section className="focus-heading">
        <p className="eyebrow">
          {text(
            "focus.eyebrow",
          )}
        </p>

        <h1>
          {text(
            "focus.pageTitle",
          )}
        </h1>

        <p>
          {text(
            "focus.pageDescription",
          )}
        </p>
      </section>

      <FocusTimer />
    </main>
  );
}
