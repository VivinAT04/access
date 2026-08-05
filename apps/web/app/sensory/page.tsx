import Link from "next/link";
import { redirect } from "next/navigation";

import { Logo } from "@/components/layout/logo";
import { SensoryManager } from "@/components/sensory/sensory-manager";
import { getCurrentUser } from "@/lib/server-auth";


export default async function SensoryPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="sensory-page">
      <header className="tasks-header">
        <Logo />

        <Link
          className="button button-secondary"
          href="/dashboard"
        >
          Back to dashboard
        </Link>
      </header>

      <section className="sensory-page-heading">
        <p className="eyebrow">
          Sensory support
        </p>

        <h1>
          Shape the space around you.
        </h1>

        <p>
          Choose sound, visual intensity and spacing
          settings that make Aksess feel easier to use.
        </p>
      </section>

      <SensoryManager />
    </main>
  );
}
