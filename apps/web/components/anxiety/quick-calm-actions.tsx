"use client";

import { useRouter } from "next/navigation";


export function QuickCalmActions() {
  const router = useRouter();

  function openGuidedTools() {
    router.push("/anxiety");
  }

  function returnToDashboard() {
    router.push("/dashboard");
  }

  return (
    <div className="quick-calm-actions">
      <button
        className="button button-primary"
        onClick={openGuidedTools}
        type="button"
      >
        Open guided tools
      </button>

      <button
        className="button button-secondary"
        onClick={returnToDashboard}
        type="button"
      >
        Return to dashboard
      </button>
    </div>
  );
}
