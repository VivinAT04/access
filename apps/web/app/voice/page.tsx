import {
  redirect,
} from "next/navigation";

import {
  VoiceGuidanceCentre,
} from "@/components/voice/voice-guidance-centre";

import {
  getCurrentUser,
} from "@/lib/server-auth";


export default async function VoicePage() {
  const user =
    await getCurrentUser();

  if (!user) {
    redirect(
      "/login",
    );
  }

  return (
    <VoiceGuidanceCentre />
  );
}
