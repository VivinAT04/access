import {
  redirect,
} from "next/navigation";

import {
  SensoryPageContent,
} from "@/components/sensory/sensory-page-content";
import {
  getCurrentUser,
} from "@/lib/server-auth";


export default async function SensoryPage() {
  const user =
    await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <SensoryPageContent />
  );
}
