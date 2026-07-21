import Link from "next/link";
import { redirect } from "next/navigation";

import { Logo } from "@/components/layout/logo";
import { getCurrentUser } from "@/lib/server-auth";

export default async function HomePage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="home-page">
      <header className="home-header">
        <Logo />

        <nav className="home-navigation">
          <Link
            className="button button-secondary"
            href="/login"
          >
            Sign in
          </Link>
          <Link
            className="button button-primary"
            href="/register"
          >
            Get started
          </Link>
        </nav>
      </header>

      <section className="hero-section">
        <div className="hero-content">
          <p className="eyebrow">
            Accessible wellbeing support
          </p>

          <h1>
            A calmer way to plan, focus and care for
            yourself.
          </h1>

          <p className="hero-description">
            Aksess brings practical tools for executive
            function, anxiety, focus and reflection into one
            personalised and accessible space.
          </p>

          <div className="hero-actions">
            <Link
              className="button button-primary button-large"
              href="/register"
            >
              Create your space
            </Link>

            <Link
              className="button button-secondary button-large"
              href="/login"
            >
              I already have an account
            </Link>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="visual-orbit orbit-one" />
          <div className="visual-orbit orbit-two" />
          <div className="visual-orbit orbit-three" />
          <div className="visual-core">A</div>
        </div>
      </section>

      <section className="home-feature-grid">
        <article>
          <span>01</span>
          <h2>Adaptable</h2>
          <p>
            Adjust the experience around your access needs
            and preferences.
          </p>
        </article>

        <article>
          <span>02</span>
          <h2>Practical</h2>
          <p>
            Break difficult tasks and moments into clearer
            next steps.
          </p>
        </article>

        <article>
          <span>03</span>
          <h2>Supportive</h2>
          <p>
            Access tools without judgement, pressure or
            unnecessary complexity.
          </p>
        </article>
      </section>
    </main>
  );
}
