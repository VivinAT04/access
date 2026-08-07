import { redirect } from "next/navigation";

import { AccessibilityPageContent } from "@/components/accessibility/accessibility-page-content";
import { getCurrentUser } from "@/lib/server-auth";

export default async function AccessibilitySettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return <AccessibilityPageContent />;
}
