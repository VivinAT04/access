import Link from "next/link";
import { redirect } from "next/navigation";

import { LanguageReadingManager } from "@/components/language/language-reading-manager";
import { Logo } from "@/components/layout/logo";
import { getCurrentUser } from "@/lib/server-auth";


export default async function LanguageReadingPage() {
  const user =
    await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="language-page">
      <header className="tasks-header">
        <Logo />

        <Link
          className="button button-secondary"
          href="/dashboard"
        >
          Back to dashboard
        </Link>
      </header>

      <section className="language-page-heading">
        <p className="eyebrow">
          Language and reading support
        </p>

        <h1>
          Read Aksess in a way that suits you.
        </h1>

        <p>
          Choose a language, text direction,
          letter spacing and reading support
          preferences.
        </p>
      </section>

      <LanguageReadingManager />
    </main>
  );
}
