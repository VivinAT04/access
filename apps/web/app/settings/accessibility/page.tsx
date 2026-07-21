import Link from "next/link";
import { redirect } from "next/navigation";

import { AccessibilityForm } from "@/components/accessibility/accessibility-form";
import { Logo } from "@/components/layout/logo";
import { getCurrentUser } from "@/lib/server-auth";


export default async function AccessibilitySettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="settings-page">
      <header className="settings-header">
        <Logo />

        <nav aria-label="Settings navigation">
          <Link
            className="button button-secondary"
            href="/dashboard"
          >
            Back to dashboard
          </Link>
        </nav>
      </header>

      <section className="settings-heading">
        <p className="eyebrow">
          Personalise your experience
        </p>
        <h1>Accessibility settings</h1>
        <p>
          Adjust how Aksess looks and behaves. These settings
          are saved to your account.
        </p>
      </section>

      <AccessibilityForm />
    </main>
  );
}
