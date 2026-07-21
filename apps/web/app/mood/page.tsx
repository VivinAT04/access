import Link from "next/link";
import { redirect } from "next/navigation";

import { Logo } from "@/components/layout/logo";
import { MoodCheckinPanel } from "@/components/mood/mood-checkin";
import { getCurrentUser } from "@/lib/server-auth";


export default async function MoodPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="mood-page">
      <header className="tasks-header">
        <Logo />

        <Link
          className="button button-secondary"
          href="/dashboard"
        >
          Back to dashboard
        </Link>
      </header>

      <section className="mood-heading">
        <p className="eyebrow">
          A private moment to reflect
        </p>

        <h1>
          Mood check-in
        </h1>

        <p>
          Record how you feel, notice your
          energy and stress, and recognise
          patterns without pressure.
        </p>
      </section>

      <MoodCheckinPanel />
    </main>
  );
}
