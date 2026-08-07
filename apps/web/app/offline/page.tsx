import {
  redirect,
} from "next/navigation";

import {
  OfflineCentre,
} from "@/components/offline/offline-centre";

import {
  getCurrentUser,
} from "@/lib/server-auth";


export default async function OfflinePage() {
  const user =
    await getCurrentUser();

  if (!user) {
    redirect(
      "/login",
    );
  }

  return (
    <OfflineCentre />
  );
}
