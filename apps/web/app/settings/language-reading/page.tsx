import { redirect } from "next/navigation";

import { LanguagePageContent } from "@/components/language/language-page-content";
import { getCurrentUser } from "@/lib/server-auth";

export default async function LanguageReadingPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return <LanguagePageContent />;
}
