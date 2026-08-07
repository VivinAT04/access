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
  PrivacyPreference,
  PrivacySummary,
} from "@/lib/types";


type PrivacyToggleKey =
  | "adaptive_personalisation"
  | "wellbeing_analytics"
  | "community_profile_visible"
  | "wearable_data_enabled"
  | "voice_processing_enabled"
  | "research_data_sharing";


const labels:
  Record<
    PrivacyToggleKey,
    {
      title: string;
      description: string;
    }
  > = {
    adaptive_personalisation: {
      title:
        "Adaptive personalisation",
      description:
        "Allow Aksess to use your own activity patterns to personalise suggestions.",
    },

    wellbeing_analytics: {
      title:
        "Wellbeing analytics",
      description:
        "Use your check-ins, reflections and focus activity to calculate private trends.",
    },

    community_profile_visible: {
      title:
        "Community profile visibility",
      description:
        "Allow profile information to be shown in future community features.",
    },

    wearable_data_enabled: {
      title:
        "Wearable data",
      description:
        "Allow future smartwatch or health-device data to be processed when connected.",
    },

    voice_processing_enabled: {
      title:
        "Voice processing",
      description:
        "Allow future voice-guided features to process microphone input when actively used.",
    },

    research_data_sharing: {
      title:
        "Research data sharing",
      description:
        "Allow future anonymised research use. This remains off unless you explicitly enable it.",
    },
  };


export function PrivacyCentre() {
  const [
    preferences,
    setPreferences,
  ] =
    useState<
      PrivacyPreference
      | null
    >(null);

  const [
    summary,
    setSummary,
  ] =
    useState<
      PrivacySummary
      | null
    >(null);

  const [
    isLoading,
    setIsLoading,
  ] =
    useState(true);

  const [
    isSaving,
    setIsSaving,
  ] =
    useState(false);

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

        setError("");

        try {
          const [
            preferencesResponse,
            summaryResponse,
          ] =
            await Promise.all([
              fetch(
                "/api/privacy/preferences",
                {
                  cache:
                    "no-store",
                },
              ),

              fetch(
                "/api/privacy/summary",
                {
                  cache:
                    "no-store",
                },
              ),
            ]);

          if (
            !preferencesResponse.ok
            || !summaryResponse.ok
          ) {
            throw new Error(
              "Privacy settings could not be loaded.",
            );
          }

          const preferencesData:
            PrivacyPreference =
              await preferencesResponse.json();

          const summaryData:
            PrivacySummary =
              await summaryResponse.json();

          setPreferences(
            preferencesData,
          );

          setSummary(
            summaryData,
          );
        } catch (
          caughtError
        ) {
          setError(
            caughtError
            instanceof Error
              ? caughtError.message
              : "Privacy settings could not be loaded.",
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


  async function updatePreference(
    key: PrivacyToggleKey,
    value: boolean,
  ) {
    if (!preferences) {
      return;
    }

    const previous =
      preferences;

    const next = {
      ...preferences,
      [key]:
        value,
    };

    setPreferences(
      next,
    );

    setMessage("");
    setError("");
    setIsSaving(
      true,
    );

    try {
      const response =
        await fetch(
          "/api/privacy/preferences",
          {
            method:
              "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                [key]:
                  value,
              }),
          },
        );

      if (!response.ok) {
        throw new Error(
          "The privacy setting could not be saved.",
        );
      }

      const updatedPreferences:
        PrivacyPreference =
          await response.json();

      setPreferences(
        updatedPreferences,
      );

      setMessage(
        "Privacy preference saved.",
      );
    } catch (
      caughtError
    ) {
      setPreferences(
        previous,
      );

      setError(
        caughtError
        instanceof Error
          ? caughtError.message
          : "The privacy setting could not be saved.",
      );
    } finally {
      setIsSaving(
        false,
      );
    }
  }


  const privacyKeys:
    PrivacyToggleKey[] =
      Object.keys(
        labels,
      ) as PrivacyToggleKey[];


  return (
    <main className="phase3-page">
      <header className="phase3-header">
        <Logo />

        <Link
          className="button button-secondary"
          href="/dashboard"
        >
          Back to dashboard
        </Link>
      </header>

      <section className="phase3-hero">
        <p className="eyebrow">
          Privacy centre
        </p>

        <h1>
          Your data, your choices
        </h1>

        <p>
          Advanced features remain optional.
          Control which kinds of personalisation
          and future integrations Aksess may use.
        </p>
      </section>

      {error ? (
        <p
          className="task-message task-error"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {message ? (
        <p
          className="task-message task-success"
          role="status"
        >
          {message}
        </p>
      ) : null}

      {isLoading ? (
        <p role="status">
          Loading privacy settings...
        </p>
      ) : null}

      {
        !isLoading
        && preferences
          ? (
            <section className="phase3-section">
              <p className="eyebrow">
                Data controls
              </p>

              <h2>
                Optional processing
              </h2>

              <div className="phase3-toggle-list">
                {
                  privacyKeys.map(
                    (
                      key,
                    ) => (
                      <label
                        className="phase3-toggle"
                        key={
                          key
                        }
                      >
                        <span>
                          <strong>
                            {
                              labels[
                                key
                              ]
                                .title
                            }
                          </strong>

                          <small>
                            {
                              labels[
                                key
                              ]
                                .description
                            }
                          </small>
                        </span>

                        <input
                          checked={
                            preferences[
                              key
                            ]
                          }
                          disabled={
                            isSaving
                          }
                          onChange={(
                            event,
                          ) =>
                            void updatePreference(
                              key,
                              event
                                .target
                                .checked,
                            )
                          }
                          type="checkbox"
                        />
                      </label>
                    ),
                  )
                }
              </div>
            </section>
          )
          : null
      }

      {
        summary
          ? (
            <section className="phase3-section">
              <p className="eyebrow">
                Transparency
              </p>

              <h2>
                What Aksess stores
              </h2>

              <div className="phase3-card-grid">
                {
                  summary
                    .categories
                    .map(
                      (
                        category,
                      ) => (
                        <article
                          className="phase3-card"
                          key={
                            category.key
                          }
                        >
                          <h3>
                            {
                              category
                                .title
                            }
                          </h3>

                          <p>
                            {
                              category
                                .description
                            }
                          </p>

                          <small>
                            <strong>
                              Purpose:
                            </strong>{" "}
                            {
                              category
                                .purpose
                            }
                          </small>
                        </article>
                      ),
                    )
                }
              </div>

              <div className="phase3-policy-copy">
                <p>
                  {
                    summary
                      .storage_statement
                  }
                </p>

                <p>
                  {
                    summary
                      .personalisation_statement
                  }
                </p>

                <p>
                  {
                    summary
                      .sharing_statement
                  }
                </p>
              </div>
            </section>
          )
          : null
      }

      <section className="phase3-section">
        <p className="eyebrow">
          Privacy policy
        </p>

        <h2>
          Aksess privacy principles
        </h2>

        <div className="phase3-policy-copy">
          <p>
            Aksess follows data-minimisation:
            features should only request data
            that they actually need.
          </p>

          <p>
            Sensitive advanced capabilities,
            including wearables, voice
            processing, community visibility
            and adaptive personalisation, are
            opt-in rather than automatically
            enabled.
          </p>

          <p>
            Users should be able to change
            their preferences without losing
            access to unrelated core
            wellbeing features.
          </p>

          <p>
            Automated wellbeing insights are
            supportive information and must
            not be presented as diagnosis or
            professional medical advice.
          </p>
        </div>
      </section>
    </main>
  );
}
