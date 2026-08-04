import Link from "next/link";
import { redirect } from "next/navigation";

import { Logo } from "@/components/layout/logo";
import { ReminderManager } from "@/components/reminders/reminder-manager";
import { getCurrentUser } from "@/lib/server-auth";


export default async function RemindersPage() {
  const user =
    await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="reminders-page">
      <header className="tasks-header">
        <Logo />

        <Link
          className="button button-secondary"
          href="/dashboard"
        >
          Back to dashboard
        </Link>
      </header>

      <section className="reminders-heading">
        <p className="eyebrow">
          Gentle prompts at useful times
        </p>

        <h1>
          Reminders
        </h1>

        <p>
          Set optional reminders for
          tasks, routines or important
          personal prompts.
        </p>
      </section>

      <ReminderManager />
    </main>
  );
}
