"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { phase2Text } from "@/components/i18n/phase2-translations";
import { useLanguage } from "@/components/language/language-provider";

import type {
  CompanionProfile,
  CompanionReward,
  CompanionType,
} from "@/lib/types";


const characterOptions: Array<{
  type: CompanionType;
  label: string;
  symbol: string;
  description: string;
}> = [
  {
    type: "sprout",
    label: "Sprout",
    symbol: "🌱",
    description:
      "A quiet growing companion.",
  },
  {
    type: "owl",
    label: "Owl",
    symbol: "🦉",
    description:
      "A calm late-night study partner.",
  },
  {
    type: "cloud",
    label: "Cloud",
    symbol: "☁️",
    description:
      "A soft, low-stimulation presence.",
  },
  {
    type: "fox",
    label: "Fox",
    symbol: "🦊",
    description:
      "A warm and curious focus friend.",
  },
];


async function readJson(
  response: Response,
): Promise<unknown> {
  const text =
    await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      message:
        "The server returned an invalid response.",
    };
  }
}


function getError(
  value: unknown,
  fallback: string,
): string {
  if (
    typeof value === "object" &&
    value !== null &&
    "detail" in value &&
    typeof value.detail === "string"
  ) {
    return value.detail;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "message" in value &&
    typeof value.message === "string"
  ) {
    return value.message;
  }

  return fallback;
}


function symbolFor(
  type: CompanionType,
): string {
  return (
    characterOptions.find(
      (option) =>
        option.type === type,
    )?.symbol ?? "🌱"
  );
}


export function CompanionManager() {
  const { locale } = useLanguage();

  const t = (
    key: string,
    values: Record<string, string | number> = {},
  ) => phase2Text(
    locale,
    key,
    values,
  );

  const [
    profile,
    setProfile,
  ] = useState<
    CompanionProfile | null
  >(null);

  const [
    rewards,
    setRewards,
  ] = useState<
    CompanionReward[]
  >([]);

  const [name, setName] =
    useState("");

  const [
    companionType,
    setCompanionType,
  ] = useState<CompanionType>(
    "sprout",
  );

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [isSaving, setIsSaving] =
    useState(false);


  const loadData = useCallback(
    async () => {
      setError("");

      try {
        const [
          profileResponse,
          rewardsResponse,
        ] = await Promise.all([
          fetch(
            "/api/companion/profile",
            {
              cache: "no-store",
            },
          ),
          fetch(
            "/api/companion/rewards",
            {
              cache: "no-store",
            },
          ),
        ]);

        const profileData =
          await readJson(
            profileResponse,
          );

        const rewardsData =
          await readJson(
            rewardsResponse,
          );

        if (!profileResponse.ok) {
          throw new Error(
            getError(
              profileData,
              t("companion.profileLoadFailed"),
            ),
          );
        }

        const loadedProfile =
          profileData as CompanionProfile;

        setProfile(
          loadedProfile,
        );

        setName(
          loadedProfile
            .companion_name,
        );

        setCompanionType(
          loadedProfile
            .companion_type,
        );

        if (rewardsResponse.ok) {
          setRewards(
            rewardsData as CompanionReward[],
          );
        }
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : t("companion.loadFailed"),
        );
      }
    },
    [],
  );


  useEffect(() => {
    const timeoutId =
      window.setTimeout(() => {
        void loadData();
      }, 0);

    return () =>
      window.clearTimeout(
        timeoutId,
      );
  }, [loadData]);


  const xpRemaining =
    useMemo(() => {
      if (!profile) {
        return 0;
      }

      return Math.max(
        profile.xp_for_next_level
        - profile.total_xp,
        0,
      );
    }, [profile]);


  async function saveProfile(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!name.trim()) {
      setError(
        t("companion.nameRequired"),
      );

      return;
    }

    setIsSaving(true);
    setError("");
    setMessage("");

    const response =
      await fetch(
        "/api/companion/profile",
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            companion_type:
              companionType,
            companion_name:
              name.trim(),
          }),
        },
      );

    const data =
      await readJson(response);

    if (!response.ok) {
      setError(
        getError(
          data,
          t("companion.saveFailed"),
        ),
      );

      setIsSaving(false);

      return;
    }

    setProfile(
      data as CompanionProfile,
    );

    setMessage(
      t("companion.updated"),
    );

    setIsSaving(false);
  }


  if (!profile) {
    return (
      <section className="companion-loading-card">
        {error
          ? error
          : t("companion.loading")}
      </section>
    );
  }


  return (
    <>
      {message ? (
        <p className="task-message task-success">
          {message}
        </p>
      ) : null}

      {error ? (
        <p className="task-message task-error">
          {error}
        </p>
      ) : null}

      <section className="companion-hero-card">
        <div className="companion-character-scene">
          <div
            aria-label={
              t(
                "companion.aria",
                {
                  name:
                    profile.companion_name,
                  type:
                    profile.companion_type,
                },
              )
            }
            className="companion-character companion-character-idle"
            role="img"
          >
            {symbolFor(
              profile.companion_type,
            )}
          </div>

          <div className="companion-speech">
            <strong>
              {profile.companion_name}
            </strong>

            <p>
              {t("companion.speech")}
            </p>
          </div>
        </div>

        <div className="companion-progress-panel">
          <span>
            {t(
              "companion.level",
              {
                level:
                  profile.current_level,
              },
            )}
          </span>

          <strong>
            {profile.total_xp} XP
          </strong>

          <div className="companion-xp-track">
            <div
              style={{
                width:
                  `${profile.level_progress_percentage}%`,
              }}
            />
          </div>

          <small>
            {t(
              "companion.nextLevel",
              {
                xp: xpRemaining,
              },
            )}
          </small>
        </div>
      </section>

      <section className="companion-stat-grid">
        <article>
          <span>
            {t("companion.focusSessions")}
          </span>

          <strong>
            {profile.completed_sessions}
          </strong>
        </article>

        <article>
          <span>
            {t("companion.focusMinutes")}
          </span>

          <strong>
            {profile.total_focus_minutes}
          </strong>
        </article>

        <article>
          <span>
            {t("companion.currentLevel")}
          </span>

          <strong>
            {profile.current_level}
          </strong>
        </article>
      </section>

      <section className="companion-layout">
        <form
          className="companion-customise-card"
          onSubmit={saveProfile}
        >
          <p className="eyebrow">
            {t("companion.customise")}
          </p>

          <h2>
            {t("companion.choose")}
          </h2>

          <label>
            <span>
              {t("companion.name")}
            </span>

            <input
              maxLength={80}
              onChange={(event) =>
                setName(
                  event.target.value,
                )
              }
              required
              value={name}
            />
          </label>

          <div
            aria-label={t("companion.chooseAria")}
            className="companion-options"
            role="radiogroup"
          >
            {characterOptions.map(
              (option) => (
                <button
                  aria-checked={
                    companionType
                    === option.type
                  }
                  className={
                    companionType
                    === option.type
                      ? "companion-option companion-option-selected"
                      : "companion-option"
                  }
                  key={option.type}
                  onClick={() =>
                    setCompanionType(
                      option.type,
                    )
                  }
                  role="radio"
                  type="button"
                >
                  <span>
                    {option.symbol}
                  </span>

                  <strong>
                    {t(
                      `companion.${option.type}`,
                    )}
                  </strong>

                  <small>
                    {
                      t(
                        `companion.${option.type}Description`,
                      )
                    }
                  </small>
                </button>
              ),
            )}
          </div>

          <button
            className="button button-primary"
            disabled={isSaving}
            type="submit"
          >
            {isSaving
              ? t("common.saving")
              : t("companion.save")}
          </button>
        </form>

        <section className="companion-support-card">
          <p className="eyebrow">
            {t("companion.support")}
          </p>

          <h2>
            {t("companion.breakTitle")}
          </h2>

          <p>
            {
              profile.break_recommendation
            }
          </p>

          <a
            className="button button-secondary"
            href="/focus"
          >
            {t(
              "companion.focusWith",
              {
                name:
                  profile.companion_name,
              },
            )}
          </a>

          <ul>
            <li>
              {t("companion.noXpLoss")}
            </li>

            <li>
              {t("companion.noBrokenStreaks")}
            </li>

            <li>
              {t("companion.shortCounts")}
            </li>

            <li>
              {t("companion.pauseNoPenalty")}
            </li>
          </ul>
        </section>
      </section>

      <section className="companion-history-card">
        <p className="eyebrow">
          {t("companion.history")}
        </p>

        <h2>
          {t("companion.recent")}
        </h2>

        {rewards.length === 0 ? (
          <div className="companion-empty">
            <strong>
              {t("companion.noRewards")}
            </strong>

            <p>
              {t("companion.noRewardsDescription")}
            </p>
          </div>
        ) : (
          <div className="companion-history-list">
            {rewards.map(
              (reward) => (
                <article
                  key={reward.id}
                >
                  <span>
                    +{reward.xp_awarded}
                    {" "}XP
                  </span>

                  <strong>
                    {t(
                      "companion.focusedMinutes",
                      {
                        minutes:
                          reward.focus_minutes,
                      },
                    )}
                  </strong>

                  <time>
                    {new Intl.DateTimeFormat(
                      locale,
                      {
                        dateStyle:
                          "medium",
                      },
                    ).format(
                      new Date(
                        reward.created_at,
                      ),
                    )}
                  </time>
                </article>
              ),
            )}
          </div>
        )}
      </section>
    </>
  );
}
