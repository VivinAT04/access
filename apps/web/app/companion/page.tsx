import Link from "next/link";
import { redirect } from "next/navigation";

import { CompanionManager } from "@/components/companion/companion-manager";
import { Logo } from "@/components/layout/logo";
import { getCurrentUser } from "@/lib/server-auth";


export default async function CompanionPage() {
  const user =
    await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="companion-page">
      <header className="tasks-header">
        <Logo />

        <Link
          className="button button-secondary"
          href="/dashboard"
        >
          Back to dashboard
        </Link>
      </header>

      <section className="companion-page-heading">
        <p className="eyebrow">
          Body-doubling companion
        </p>

        <h1>
          Focus alongside someone gentle.
        </h1>

        <p>
          Your companion stays with you
          while you focus, celebrates
          completed minutes and encourages
          breaks without punishment.
        </p>
      </section>

      <CompanionManager />
    </main>
  );
}
