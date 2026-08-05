"use client";

import Link from "next/link";

import {
  taskText,
} from "@/components/i18n/task-translations";
import {
  useLanguage,
} from "@/components/language/language-provider";
import {
  Logo,
} from "@/components/layout/logo";
import {
  TaskManager,
} from "@/components/tasks/task-manager";


export function TasksPageContent() {
  const { locale } =
    useLanguage();

  const text = (
    key:
      Parameters<
        typeof taskText
      >[1],
  ) => taskText(
    locale,
    key,
  );

  return (
    <main className="tasks-page">
      <header className="tasks-header">
        <Logo />

        <nav
          aria-label={text(
            "task.navigation",
          )}
        >
          <Link
            className="button button-secondary"
            href="/dashboard"
          >
            {text(
              "common.backDashboard",
            )}
          </Link>
        </nav>
      </header>

      <section className="tasks-heading">
        <p className="eyebrow">
          {text(
            "task.eyebrow",
          )}
        </p>

        <h1>
          {text(
            "task.pageTitle",
          )}
        </h1>

        <p>
          {text(
            "task.pageDescription",
          )}
        </p>
      </section>

      <TaskManager />
    </main>
  );
}
