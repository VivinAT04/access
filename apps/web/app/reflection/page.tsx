import Link from "next/link";
import { redirect } from "next/navigation";

import { Logo } from "@/components/layout/logo";
import { ReflectionPanel } from "@/components/reflection/reflection-panel";
import { getCurrentUser } from "@/lib/server-auth";


export default async function ReflectionPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="reflection-page">
      <header className="tasks-header">
        <Logo />

        <Link
          className="button button-secondary"
          href="/dashboard"
        >
          Back to dashboard
        </Link>
      </header>

      <section className="reflection-heading">
        <p className="eyebrow">
          A short moment for yourself
        </p>

        <h1>
          Daily reflection
        </h1>

        <p>
          Notice one good thing, one
          challenge and one accomplishment
          without the pressure of writing
          a long journal entry.
        </p>
      </section>

      <ReflectionPanel />
    </main>
  );
}
