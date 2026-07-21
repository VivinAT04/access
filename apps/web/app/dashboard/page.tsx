import Link from "next/link";
import { redirect } from "next/navigation";

import { Logo } from "@/components/layout/logo";
import { LogoutButton } from "@/components/layout/logout-button";
import { getCurrentUser } from "@/lib/server-auth";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const firstName =
    user.full_name.trim().split(/\s+/)[0] || "there";

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <Logo />

        <div className="dashboard-user-area">
          <span>{user.email}</span>
          <LogoutButton />
        </div>
      </header>

      <section className="dashboard-content">
        <div className="welcome-card">
          <div>
            <p className="eyebrow">Your Aksess space</p>
            <h1>Welcome, {firstName}.</h1>
            <p>
              Your wellbeing dashboard is ready. The next
              features will be added here.
            </p>
          </div>

          <div
            className="welcome-symbol"
            aria-hidden="true"
          >
            A
          </div>
        </div>

        <div className="dashboard-grid">
          <article className="feature-card">
            <span className="feature-number">01</span>
            <h2>Plan my day</h2>
            <p>
              Organise tasks into manageable, realistic
              steps.
            </p>
            <Link
              className="status-pill feature-card-link"
              href="/tasks"
            >
              Open task manager
            </Link>
          </article>

          <article className="feature-card">
            <span className="feature-number">02</span>
            <h2>Focus session</h2>
            <p>
              Create a calm environment for focused work.
            </p>
            <Link
              className="status-pill feature-card-link"
              href="/focus"
            >
              Start focus
            </Link>
          </article>

          <article className="feature-card">
            <span className="feature-number">03</span>
            <h2>Mood check-in</h2>
            <p>
              Record how you feel without pressure or
              judgement.
            </p>
            <Link
              className="status-pill feature-card-link"
              href="/mood"
            >
              Check in now
            </Link>
          </article>

          <article className="feature-card">
            <span className="feature-number">04</span>
            <h2>Accessibility</h2>
            <p>
              Personalise text, motion, contrast and sensory
              settings.
            </p>
            <Link
              className="status-pill feature-card-link"
              href="/settings/accessibility"
            >
              Open settings
            </Link>
          </article>
        </div>

        <section className="account-card">
          <div>
            <p className="eyebrow">Account</p>
            <h2>Your profile</h2>
          </div>

          <dl className="profile-details">
            <div>
              <dt>Full name</dt>
              <dd>{user.full_name}</dd>
            </div>

            <div>
              <dt>Email</dt>
              <dd>{user.email}</dd>
            </div>

            <div>
              <dt>Account status</dt>
              <dd>
                {user.is_active ? "Active" : "Inactive"}
              </dd>
            </div>

            <div>
              <dt>Email verification</dt>
              <dd>
                {user.is_verified
                  ? "Verified"
                  : "Not verified"}
              </dd>
            </div>
          </dl>
        </section>
      </section>
    </main>
  );
}
