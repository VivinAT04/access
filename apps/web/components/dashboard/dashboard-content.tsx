"use client";

import Link from "next/link";

import {
  useLanguage,
} from "@/components/language/language-provider";
import { Logo } from "@/components/layout/logo";
import { LogoutButton } from "@/components/layout/logout-button";

import type {
  TranslationKey,
} from "@/components/i18n/translations";


interface DashboardUser {
  email: string;
  fullName: string;
  firstName: string;
  isActive: boolean;
  isVerified: boolean;
}


interface FeatureCardDefinition {
  number: string;
  href: string;
  title: TranslationKey;
  description: TranslationKey;
  action: TranslationKey;
}


const featureCards:
  FeatureCardDefinition[] = [
    {
      number: "01",
      href: "/tasks",
      title:
        "dashboard.plan.title",
      description:
        "dashboard.plan.description",
      action:
        "dashboard.plan.action",
    },
    {
      number: "02",
      href: "/focus",
      title:
        "dashboard.focus.title",
      description:
        "dashboard.focus.description",
      action:
        "dashboard.focus.action",
    },
    {
      number: "03",
      href: "/mood",
      title:
        "dashboard.mood.title",
      description:
        "dashboard.mood.description",
      action:
        "dashboard.mood.action",
    },
    {
      number: "04",
      href:
        "/settings/accessibility",
      title:
        "dashboard.accessibility.title",
      description:
        "dashboard.accessibility.description",
      action:
        "dashboard.accessibility.action",
    },
    {
      number: "05",
      href: "/reflection",
      title:
        "dashboard.reflection.title",
      description:
        "dashboard.reflection.description",
      action:
        "dashboard.reflection.action",
    },
    {
      number: "06",
      href: "/anxiety",
      title:
        "dashboard.anxiety.title",
      description:
        "dashboard.anxiety.description",
      action:
        "dashboard.anxiety.action",
    },
    {
      number: "07",
      href: "/calm",
      title:
        "dashboard.quickCalm.title",
      description:
        "dashboard.quickCalm.description",
      action:
        "dashboard.quickCalm.action",
    },
    {
      number: "08",
      href: "/routines",
      title:
        "dashboard.routines.title",
      description:
        "dashboard.routines.description",
      action:
        "dashboard.routines.action",
    },
    {
      number: "09",
      href: "/reminders",
      title:
        "dashboard.reminders.title",
      description:
        "dashboard.reminders.description",
      action:
        "dashboard.reminders.action",
    },
    {
      number: "10",
      href: "/companion",
      title:
        "dashboard.companion.title",
      description:
        "dashboard.companion.description",
      action:
        "dashboard.companion.action",
    },
    {
      number: "11",
      href: "/sensory",
      title:
        "dashboard.sensory.title",
      description:
        "dashboard.sensory.description",
      action:
        "dashboard.sensory.action",
    },
    {
      number: "12",
      href: "/insights",
      title:
        "dashboard.insights.title",
      description:
        "dashboard.insights.description",
      action:
        "dashboard.insights.action",
    },
    {
      number: "13",
      href:
        "/settings/language-reading",
      title:
        "dashboard.language.title",
      description:
        "dashboard.language.description",
      action:
        "dashboard.language.action",
    },
    {
      number: "14",
      href: "/community",
      title:
        "dashboard.community.title",
      description:
        "dashboard.community.description",
      action:
        "dashboard.community.action",
    },
    {
      number: "15",
      href: "/notifications",
      title:
        "dashboard.notifications.title",
      description:
        "dashboard.notifications.description",
      action:
        "dashboard.notifications.action",
    },
    {
      number: "16",
      href: "/personalisation",
      title:
        "dashboard.personalisation.title",
      description:
        "dashboard.personalisation.description",
      action:
        "dashboard.personalisation.action",
    },
    {
      number: "17",
      href: "/voice",
      title:
        "dashboard.voice.title",
      description:
        "dashboard.voice.description",
      action:
        "dashboard.voice.action",
    },
    {
      number: "18",
      href: "/wearables",
      title:
        "dashboard.wearables.title",
      description:
        "dashboard.wearables.description",
      action:
        "dashboard.wearables.action",
    },
    {
      number: "19",
      href: "/offline",
      title:
        "dashboard.offline.title",
      description:
        "dashboard.offline.description",
      action:
        "dashboard.offline.action",
    },
  ];


export function DashboardContent({
  user,
}: {
  user: DashboardUser;
}) {
  const { t } =
    useLanguage();

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <Logo />

        <div className="dashboard-user-area">
          <span>
            {user.email}
          </span>

          <LogoutButton />
        </div>
      </header>

      <section className="dashboard-content">
        <div className="welcome-card">
          <div>
            <p className="eyebrow">
              {t(
                "dashboard.space",
              )}
            </p>

            <h1>
              {t(
                "dashboard.welcome",
                {
                  name:
                    user.firstName,
                },
              )}
            </h1>

            <p>
              {t(
                "dashboard.description",
              )}
            </p>
          </div>

          <div
            aria-hidden="true"
            className="welcome-symbol"
          >
            A
          </div>
        </div>

        <div className="dashboard-grid">
          {featureCards.map(
            (card) => (
              <article
                className="feature-card"
                key={card.number}
              >
                <span className="feature-number">
                  {card.number}
                </span>

                <h2>
                  {t(card.title)}
                </h2>

                <p>
                  {t(
                    card.description,
                  )}
                </p>

                <Link
                  className="status-pill feature-card-link"
                  href={card.href}
                >
                  {t(card.action)}
                </Link>
              </article>
            ),
          )}
        </div>

        <section className="account-card">
          <div>
            <p className="eyebrow">
              {t(
                "dashboard.account",
              )}
            </p>

            <h2>
              {t(
                "dashboard.profile",
              )}
            </h2>
          </div>

          <dl className="profile-details">
            <div>
              <dt>
                {t(
                  "dashboard.fullName",
                )}
              </dt>

              <dd>
                {user.fullName}
              </dd>
            </div>

            <div>
              <dt>
                {t(
                  "dashboard.email",
                )}
              </dt>

              <dd>
                {user.email}
              </dd>
            </div>

            <div>
              <dt>
                {t(
                  "dashboard.accountStatus",
                )}
              </dt>

              <dd>
                {user.isActive
                  ? t(
                      "dashboard.active",
                    )
                  : t(
                      "dashboard.inactive",
                    )}
              </dd>
            </div>

            <div>
              <dt>
                {t(
                  "dashboard.emailVerification",
                )}
              </dt>

              <dd>
                {user.isVerified
                  ? t(
                      "dashboard.verified",
                    )
                  : t(
                      "dashboard.notVerified",
                    )}
              </dd>
            </div>
          </dl>
        </section>
      </section>
    </main>
  );
}
