import {
  redirect,
} from "next/navigation";

import {
  SupportCentre,
} from "@/components/support/support-centre";

import {
  getCurrentUser,
} from "@/lib/server-auth";


export default async function SupportPage() {
  const user =
    await getCurrentUser();

  if (!user) {
    redirect(
      "/login",
    );
  }

  return (
    <SupportCentre />
  );
}
