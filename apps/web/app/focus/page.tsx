import Link from "next/link";
import { redirect } from "next/navigation";

import { FocusTimer } from "@/components/focus/focus-timer";
import { Logo } from "@/components/layout/logo";
import { getCurrentUser } from "@/lib/server-auth";


export default async function FocusPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="focus-page">
      <header className="tasks-header">
        <Logo />

        <Link
          className="button button-secondary"
          href="/dashboard"
        >
          Back to dashboard
        </Link>
      </header>

      <section className="focus-heading">
        <p className="eyebrow">
          Calm, structured concentration
        </p>

        <h1>
          Focus session
        </h1>

        <p>
          Choose one clear intention, set a
          comfortable duration and work without
          pressure.
        </p>
      </section>

      <FocusTimer />
    </main>
  );
}
