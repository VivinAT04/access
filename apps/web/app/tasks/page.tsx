import {
  redirect,
} from "next/navigation";

import {
  TasksPageContent,
} from "@/components/tasks/tasks-page-content";
import {
  getCurrentUser,
} from "@/lib/server-auth";


export default async function TasksPage() {
  const user =
    await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <TasksPageContent />
  );
}
