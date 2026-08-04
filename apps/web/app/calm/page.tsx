import { redirect } from "next/navigation";

import { QuickCalmActions } from "@/components/anxiety/quick-calm-actions";
import { getCurrentUser } from "@/lib/server-auth";


export default async function CalmPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="quick-calm-page">
      <div className="quick-calm-content">
        <p className="eyebrow">
          Quick Calm
        </p>

        <h1>
          You only need to take the next breath.
        </h1>

        <div
          aria-label="Slow breathing animation"
          className="quick-calm-circle"
        >
          <span>
            Breathe slowly
          </span>
        </div>

        <p className="quick-calm-message">
          Place both feet on the floor if
          that feels comfortable. Let your
          shoulders soften. Notice that you
          are here, in this moment.
        </p>

        <QuickCalmActions />

        <p className="quick-calm-safety">
          Aksess supports grounding and
          reflection but does not replace
          emergency or professional care.
        </p>
      </div>
    </main>
  );
}
