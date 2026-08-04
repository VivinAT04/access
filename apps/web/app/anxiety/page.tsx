import Link from "next/link";
import { redirect } from "next/navigation";

import { AnxietyTools } from "@/components/anxiety/anxiety-tools";
import { Logo } from "@/components/layout/logo";
import { getCurrentUser } from "@/lib/server-auth";


export default async function AnxietyPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="anxiety-page">
      <header className="tasks-header">
        <Logo />

        <Link
          className="button button-secondary"
          href="/dashboard"
        >
          Back to dashboard
        </Link>
      </header>

      <section className="anxiety-heading">
        <p className="eyebrow">
          Support for anxious or overwhelming moments
        </p>

        <h1>
          Anxiety and grounding
        </h1>

        <p>
          Follow a breathing rhythm, return
          to your senses or play a steady
          background sound. Stop whenever
          you need to.
        </p>
      </section>

      <AnxietyTools />
    </main>
  );
}
