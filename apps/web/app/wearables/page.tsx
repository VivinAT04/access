import {
  redirect,
} from "next/navigation";

import {
  WearableCentre,
} from "@/components/wearables/wearable-centre";

import {
  getCurrentUser,
} from "@/lib/server-auth";


export default async function WearablesPage() {
  const user =
    await getCurrentUser();

  if (!user) {
    redirect(
      "/login",
    );
  }

  return (
    <WearableCentre />
  );
}
