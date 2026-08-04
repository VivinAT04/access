import Link from "next/link";
import { redirect } from "next/navigation";

import { Logo } from "@/components/layout/logo";
import { RoutineManager } from "@/components/routines/routine-manager";
import { getCurrentUser } from "@/lib/server-auth";


export default async function RoutinesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="routines-page">
      <header className="tasks-header">
        <Logo />

        <Link
          className="button button-secondary"
          href="/dashboard"
        >
          Back to dashboard
        </Link>
      </header>

      <section className="routines-heading">
        <p className="eyebrow">
          Repeatable support for daily life
        </p>

        <h1>
          Daily routines
        </h1>

        <p>
          Build routines from small,
          ordered steps and complete them
          without relying on strict streaks.
        </p>
      </section>

      <RoutineManager />
    </main>
  );
}
