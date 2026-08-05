import { redirect } from "next/navigation";

import {
  DashboardContent,
} from "@/components/dashboard/dashboard-content";
import {
  getCurrentUser,
} from "@/lib/server-auth";


export default async function DashboardPage() {
  const user =
    await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const firstName =
    user.full_name
      .trim()
      .split(/\s+/)[0]
    || "there";

  return (
    <DashboardContent
      user={{
        email:
          user.email,
        fullName:
          user.full_name,
        firstName,
        isActive:
          user.is_active,
        isVerified:
          user.is_verified,
      }}
    />
  );
}
