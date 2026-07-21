import Link from "next/link";
import { redirect } from "next/navigation";

import { Logo } from "@/components/layout/logo";
import { TaskManager } from "@/components/tasks/task-manager";
import { getCurrentUser } from "@/lib/server-auth";


export default async function TasksPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="tasks-page">
      <header className="tasks-header">
        <Logo />

        <nav aria-label="Task navigation">
          <Link
            className="button button-secondary"
            href="/dashboard"
          >
            Back to dashboard
          </Link>
        </nav>
      </header>

      <section className="tasks-heading">
        <p className="eyebrow">
          Plan without pressure
        </p>

        <h1>Task manager</h1>

        <p>
          Capture what needs doing, choose a realistic
          priority and focus on one manageable step at a
          time.
        </p>
      </section>

      <TaskManager />
    </main>
  );
}
