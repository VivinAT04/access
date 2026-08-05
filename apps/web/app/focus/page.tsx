import {
  redirect,
} from "next/navigation";

import {
  FocusPageContent,
} from "@/components/focus/focus-page-content";
import {
  getCurrentUser,
} from "@/lib/server-auth";


export default async function FocusPage() {
  const user =
    await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <FocusPageContent />
  );
}
