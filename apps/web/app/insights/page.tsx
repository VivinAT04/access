import { redirect } from "next/navigation";

import { InsightsPageContent } from "@/components/insights/insights-page-content";
import { getCurrentUser } from "@/lib/server-auth";

export default async function InsightsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return <InsightsPageContent />;
}
