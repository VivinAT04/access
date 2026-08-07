"use client";

import Link from "next/link";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Logo,
} from "@/components/layout/logo";

import type {
  PersonalisationPreference,
  PersonalisationProfile,
  PersonalisationRecommendation,
  PersonalisationRecommendationSet,
} from "@/lib/types";


export function PersonalisationCentre() {
  const [
    profile,
    setProfile,
  ] =
    useState<
      PersonalisationProfile
      | null
    >(null);

  const [
    preferences,
    setPreferences,
  ] =
    useState<
      PersonalisationPreference
      | null
    >(null);

  const [
    recommendations,
    setRecommendations,
  ] =
    useState<
      PersonalisationRecommendation[]
    >([]);

  const [
    history,
    setHistory,
  ] =
    useState<
      PersonalisationRecommendation[]
    >([]);

  const [
    isLoading,
    setIsLoading,
  ] =
    useState(true);

  const [
    message,
    setMessage,
  ] =
    useState("");

  const [
    error,
    setError,
  ] =
    useState("");


  const loadData =
    useCallback(
      async () => {
        setIsLoading(
          true,
        );

        try {
          const [
            profileResponse,
            preferenceResponse,
            historyResponse,
          ] =
            await Promise.all([
              fetch(
                "/api/personalisation/profile",
                {
                  cache:
                    "no-store",
                },
              ),

              fetch(
                "/api/personalisation/preferences",
                {
                  cache:
                    "no-store",
                },
              ),

              fetch(
                "/api/personalisation/history",
                {
                  cache:
                    "no-store",
                },
              ),
            ]);

          if (
            !profileResponse.ok
            || !preferenceResponse.ok
            || !historyResponse.ok
          ) {
            throw new Error(
              "Personalisation data could not be loaded.",
            );
          }

          const profileData:
            PersonalisationProfile =
              await profileResponse.json();

          const preferenceData:
            PersonalisationPreference =
              await preferenceResponse.json();

          const historyData: {
            recommendations:
              PersonalisationRecommendation[];
          } =
            await historyResponse.json();

          setProfile(
            profileData,
          );

          setPreferences(
            preferenceData,
          );

          setHistory(
            historyData
              .recommendations,
          );
        } catch (
          caughtError
        ) {
          setError(
            caughtError
            instanceof Error
              ? caughtError.message
              : "Personalisation data could not be loaded.",
          );
        } finally {
          setIsLoading(
            false,
          );
        }
      },
      [],
    );


  useEffect(() => {
    const id =
      window.setTimeout(
        () => {
          void loadData();
        },
        0,
      );

    return () =>
      window.clearTimeout(
        id,
      );
  }, [
    loadData,
  ]);


  async function savePreferences(
    changes:
      Partial<
        PersonalisationPreference
      >,
  ) {
    if (!preferences) {
      return;
    }

    const response =
      await fetch(
        "/api/personalisation/preferences",
        {
          method:
            "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify(
              changes,
            ),
        },
      );

    if (!response.ok) {
      setError(
        "Preferences could not be saved.",
      );

      return;
    }

    const updated:
      PersonalisationPreference =
        await response.json();

    setPreferences(
      updated,
    );

    setMessage(
      "Personalisation preferences saved.",
    );
  }


  async function generate() {
    setMessage("");
    setError("");

    const response =
      await fetch(
        "/api/personalisation/recommendations",
        {
          method:
            "POST",
        },
      );

    if (!response.ok) {
      setError(
        "Recommendations could not be generated.",
      );

      return;
    }

    const result:
      PersonalisationRecommendationSet =
        await response.json();

    if (!result.enabled) {
      setError(
        result.explanation,
      );

      return;
    }

    setRecommendations(
      result.recommendations,
    );

    setMessage(
      result.explanation,
    );

    await loadData();
  }


  async function feedback(
    recommendationId:
      string,
    value:
      "helpful"
      | "not-helpful",
  ) {
    const response =
      await fetch(
        (
          "/api/personalisation/recommendations/"
          + recommendationId
          + "/feedback"
        ),
        {
          method:
            "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify({
              feedback:
                value,
            }),
        },
      );

    if (!response.ok) {
      setError(
        "Feedback could not be saved.",
      );

      return;
    }

    await loadData();
  }


  async function reset() {
    const confirmed =
      window.confirm(
        (
          "Delete your personalisation preferences "
          + "and recommendation history?"
        ),
      );

    if (!confirmed) {
      return;
    }

    const response =
      await fetch(
        "/api/personalisation/reset",
        {
          method:
            "DELETE",
        },
      );

    if (!response.ok) {
      setError(
        "Personalisation data could not be reset.",
      );

      return;
    }

    setRecommendations(
      [],
    );

    setMessage(
      "Personalisation data deleted.",
    );

    await loadData();
  }


  if (isLoading) {
    return (
      <main className="personalisation-page">
        <p role="status">
          Loading personalisation...
        </p>
      </main>
    );
  }


  return (
    <main className="personalisation-page">
      <header className="phase3-header">
        <Logo />

        <Link
          className="button button-secondary"
          href="/dashboard"
        >
          Back to dashboard
        </Link>
      </header>


      <section className="personalisation-hero">
        <p className="eyebrow">
          Adaptive personalisation
        </p>

        <h1>
          Support shaped by your choices
        </h1>

        <p>
          Aksess can adjust suggestions using
          preferences you explicitly choose.
          It does not diagnose conditions or
          infer mental-health disorders.
        </p>

        <div className="phase3-safety-banner">
          <strong>
            You stay in control
          </strong>

          <span>
            Adaptive personalisation only works
            when you enable it in the privacy centre.
          </span>
        </div>
      </section>


      {profile ? (
        <section className="personalisation-status-card">
          <p className="eyebrow">
            Privacy status
          </p>

          <h2>
            {
              profile
                .adaptive_personalisation_enabled
                ? "Personalisation is enabled"
                : "Personalisation is off"
            }
          </h2>

          <p>
            {
              profile.explanation
            }
          </p>

          {!profile
            .adaptive_personalisation_enabled ? (
            <Link
              className="button button-primary"
              href="/privacy"
            >
              Open privacy centre
            </Link>
          ) : null}
        </section>
      ) : null}


      {message ? (
        <p
          className="task-message task-success"
          role="status"
        >
          {message}
        </p>
      ) : null}


      {error ? (
        <p
          className="task-message task-error"
          role="alert"
        >
          {error}
        </p>
      ) : null}


      {preferences ? (
        <section className="personalisation-settings">
          <p className="eyebrow">
            Your preferences
          </p>

          <h2>
            Choose how Aksess should adapt
          </h2>


          <div className="personalisation-grid">
            <label>
              <span>
                Preferred focus minutes
              </span>

              <input
                max={120}
                min={5}
                onChange={(
                  event,
                ) =>
                  void savePreferences({
                    preferred_focus_minutes:
                      Number(
                        event
                          .target
                          .value,
                      ),
                  })
                }
                type="number"
                value={
                  preferences
                    .preferred_focus_minutes
                }
              />
            </label>


            <label>
              <span>
                Support style
              </span>

              <select
                onChange={(
                  event,
                ) => {
                  const value =
                    event.target.value as PersonalisationPreference[
                      "preferred_support_style"
                    ];

                  void savePreferences({
                    preferred_support_style:
                      value,
                  });
                }}
                value={
                  preferences
                    .preferred_support_style
                }
              >
                <option value="balanced">
                  Balanced
                </option>

                <option value="focus-first">
                  Focus first
                </option>

                <option value="calm-first">
                  Calm first
                </option>

                <option value="routine-first">
                  Routine first
                </option>
              </select>
            </label>


            <label>
              <span>
                Energy preference
              </span>

              <select
                onChange={(
                  event,
                ) => {
                  const value =
                    event.target.value as PersonalisationPreference[
                      "preferred_energy_level"
                    ];

                  void savePreferences({
                    preferred_energy_level:
                      value,
                  });
                }}
                value={
                  preferences
                    .preferred_energy_level
                }
              >
                <option value="low">
                  Lower energy
                </option>

                <option value="balanced">
                  Balanced
                </option>

                <option value="high">
                  Higher energy
                </option>
              </select>
            </label>


            <label>
              <span>
                Prompt style
              </span>

              <select
                onChange={(
                  event,
                ) => {
                  const value =
                    event.target.value as PersonalisationPreference[
                      "preferred_prompt_style"
                    ];

                  void savePreferences({
                    preferred_prompt_style:
                      value,
                  });
                }}
                value={
                  preferences
                    .preferred_prompt_style
                }
              >
                <option value="gentle">
                  Gentle
                </option>

                <option value="concise">
                  Concise
                </option>

                <option value="structured">
                  Structured
                </option>
              </select>
            </label>
          </div>


          <button
            className="button button-primary"
            disabled={
              !profile
              ?.adaptive_personalisation_enabled
            }
            onClick={() =>
              void generate()
            }
            type="button"
          >
            Generate recommendations
          </button>
        </section>
      ) : null}


      {recommendations.length > 0 ? (
        <section className="personalisation-recommendations">
          <p className="eyebrow">
            Suggested for you
          </p>

          <h2>
            Explainable recommendations
          </h2>

          <div className="personalisation-card-list">
            {recommendations.map(
              (
                recommendation,
              ) => (
                <article
                  className="personalisation-card"
                  key={
                    recommendation.id
                  }
                >
                  <span className="status-pill">
                    {
                      recommendation
                        .recommendation_type
                    }
                  </span>

                  <h3>
                    {
                      recommendation.title
                    }
                  </h3>

                  <p>
                    {
                      recommendation.message
                    }
                  </p>

                  <details>
                    <summary>
                      Why am I seeing this?
                    </summary>

                    <p>
                      {
                        recommendation.reason
                      }
                    </p>
                  </details>

                  <div className="personalisation-actions">
                    {recommendation
                      .action_url ? (
                      <Link
                        className="button button-secondary"
                        href={
                          recommendation
                            .action_url
                        }
                      >
                        Open
                      </Link>
                    ) : null}

                    <button
                      onClick={() =>
                        void feedback(
                          recommendation.id,
                          "helpful",
                        )
                      }
                      type="button"
                    >
                      Helpful
                    </button>

                    <button
                      onClick={() =>
                        void feedback(
                          recommendation.id,
                          "not-helpful",
                        )
                      }
                      type="button"
                    >
                      Not helpful
                    </button>
                  </div>
                </article>
              ),
            )}
          </div>
        </section>
      ) : null}


      <section className="personalisation-history">
        <p className="eyebrow">
          History
        </p>

        <h2>
          Previous recommendations
        </h2>

        {history.length === 0 ? (
          <p>
            No recommendation history yet.
          </p>
        ) : (
          <div className="personalisation-history-list">
            {history.map(
              (
                item,
              ) => (
                <article
                  key={
                    item.id
                  }
                >
                  <strong>
                    {
                      item.title
                    }
                  </strong>

                  <span>
                    {
                      item.feedback
                      ?? "No feedback"
                    }
                  </span>
                </article>
              ),
            )}
          </div>
        )}


        <button
          className="button button-secondary"
          onClick={() =>
            void reset()
          }
          type="button"
        >
          Delete personalisation data
        </button>
      </section>
    </main>
  );
}
