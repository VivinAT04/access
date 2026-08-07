import {
  redirect,
} from "next/navigation";

import {
  PersonalisationCentre,
} from "@/components/personalisation/personalisation-centre";

import {
  getCurrentUser,
} from "@/lib/server-auth";


export default async function PersonalisationPage() {
  const user =
    await getCurrentUser();

  if (!user) {
    redirect(
      "/login",
    );
  }

  return (
    <PersonalisationCentre />
  );
}
