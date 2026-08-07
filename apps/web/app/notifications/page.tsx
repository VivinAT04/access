import {
  redirect,
} from "next/navigation";

import {
  NotificationCentre,
} from "@/components/notifications/notification-centre";

import {
  getCurrentUser,
} from "@/lib/server-auth";


export default async function NotificationsPage() {
  const user =
    await getCurrentUser();

  if (!user) {
    redirect(
      "/login",
    );
  }

  return (
    <NotificationCentre />
  );
}
