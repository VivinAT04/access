import { redirect } from "next/navigation";

import { CompanionPageContent } from "@/components/companion/companion-page-content";
import { getCurrentUser } from "@/lib/server-auth";

export default async function CompanionPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return <CompanionPageContent />;
}
