import {
  redirect,
} from "next/navigation";

import {
  CommunityCentre,
} from "@/components/community/community-centre";

import {
  getCurrentUser,
} from "@/lib/server-auth";


export default async function CommunityPage() {
  const user =
    await getCurrentUser();

  if (!user) {
    redirect(
      "/login",
    );
  }

  return (
    <CommunityCentre />
  );
}
