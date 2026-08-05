import Link from "next/link";
import { redirect } from "next/navigation";

import { InsightsDashboard } from "@/components/insights/insights-dashboard";
import { Logo } from "@/components/layout/logo";
import { getCurrentUser } from "@/lib/server-auth";


export default async function InsightsPage() {
  const user =
    await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="insights-page">
      <header className="tasks-header">
        <Logo />

        <Link
          className="button button-secondary"
          href="/dashboard"
        >
          Back to dashboard
        </Link>
      </header>

      <section className="insights-page-heading">
        <p className="eyebrow">
          Reflection insights
        </p>

        <h1>
          Notice patterns without judgement.
        </h1>

        <p>
          Review your recent mood, energy,
          stress, focus and reflection activity
          through gentle weekly observations.
        </p>
      </section>

      <InsightsDashboard />
    </main>
  );
}
