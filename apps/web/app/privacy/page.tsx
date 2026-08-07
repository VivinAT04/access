import {
  redirect,
} from "next/navigation";

import {
  PrivacyCentre,
} from "@/components/privacy/privacy-centre";

import {
  getCurrentUser,
} from "@/lib/server-auth";


export default async function PrivacyPage() {
  const user =
    await getCurrentUser();

  if (!user) {
    redirect(
      "/login",
    );
  }

  return (
    <PrivacyCentre />
  );
}
