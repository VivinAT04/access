"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

import type {
  MoodCheckin,
  MoodSummary,
} from "@/lib/types";


const moodOptions = [
  {
    score: 1,
    icon: "😞",
    label: "Very low",
  },
  {
    score: 2,
    icon: "😕",
    label: "Low",
  },
  {
    score: 3,
    icon: "😐",
    label: "Okay",
  },
  {
    score: 4,
    icon: "🙂",
    label: "Good",
  },
  {
    score: 5,
    icon: "😊",
    label: "Great",
  },
];


const emotionOptions = [
  "calm",
  "happy",
  "hopeful",
  "focused",
  "tired",
  "anxious",
  "overwhelmed",
  "sad",
  "frustrated",
  "lonely",
];


const defaultSummary: MoodSummary = {
  entries_today: 0,
  total_entries: 0,
  average_mood: 0,
  average_energy: 0,
  average_stress: 0,
};


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


function getMessage(
  data: unknown,
  fallback: string,
): string {
  if (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof data.message === "string"
  ) {
    return data.message;
  }

  if (
    typeof data === "object" &&
    data !== null &&
    "detail" in data &&
    typeof data.detail === "string"
  ) {
    return data.detail;
  }

  return fallback;
}


function formatDate(
  value: string,
): string {
  return new Intl.DateTimeFormat(
    "en-GB",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(
    new Date(value),
  );
}


function moodLabel(
  score: number,
): string {
  return (
    moodOptions.find(
      (option) =>
        option.score === score,
    )?.label ?? "Unknown"
  );
}


function moodIcon(
  score: number,
): string {
  return (
    moodOptions.find(
      (option) =>
        option.score === score,
    )?.icon ?? "•"
  );
}


export function MoodCheckinPanel() {
  const [moodScore, setMoodScore] =
    useState(3);

  const [energyLevel, setEnergyLevel] =
    useState(3);

  const [stressLevel, setStressLevel] =
    useState(3);

  const [emotions, setEmotions] =
    useState<string[]>([]);

  const [note, setNote] =
    useState("");

  const [checkins, setCheckins] =
    useState<MoodCheckin[]>([]);

  const [summary, setSummary] =
    useState<MoodSummary>(
      defaultSummary,
    );

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");


  const loadData = useCallback(
    async () => {
      setIsLoading(true);
      setError("");

      try {
        const [
          checkinsResponse,
          summaryResponse,
        ] = await Promise.all([
          fetch(
            "/api/mood-checkins",
            {
              cache: "no-store",
            },
          ),
          fetch(
            "/api/mood-checkins/summary",
            {
              cache: "no-store",
            },
          ),
        ]);

        const checkinsData =
          await readJson(
            checkinsResponse,
          );

        const summaryData =
          await readJson(
            summaryResponse,
          );

        if (!checkinsResponse.ok) {
          throw new Error(
            getMessage(
              checkinsData,
              "Mood history could not be loaded.",
            ),
          );
        }

        if (!summaryResponse.ok) {
          throw new Error(
            getMessage(
              summaryData,
              "Mood statistics could not be loaded.",
            ),
          );
        }

        setCheckins(
          checkinsData as MoodCheckin[],
        );

        setSummary(
          summaryData as MoodSummary,
        );
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Mood data could not be loaded.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );


  useEffect(() => {
    const timeoutId =
      window.setTimeout(() => {
        void loadData();
      }, 0);

    return () => {
      window.clearTimeout(
        timeoutId,
      );
    };
  }, [loadData]);


  function toggleEmotion(
    emotion: string,
  ) {
    setEmotions((current) =>
      current.includes(emotion)
        ? current.filter(
            (item) =>
              item !== emotion,
          )
        : [
            ...current,
            emotion,
          ],
    );
  }


  async function submitCheckin(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setIsSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        "/api/mood-checkins",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            mood_score: moodScore,
            energy_level:
              energyLevel,
            stress_level:
              stressLevel,
            emotions,
            note:
              note.trim() || null,
          }),
        },
      );

      const data =
        await readJson(response);

      if (!response.ok) {
        throw new Error(
          getMessage(
            data,
            "The check-in could not be saved.",
          ),
        );
      }

      setMessage(
        "Mood check-in saved."
      );

      setMoodScore(3);
      setEnergyLevel(3);
      setStressLevel(3);
      setEmotions([]);
      setNote("");

      await loadData();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "The check-in could not be saved.",
      );
    } finally {
      setIsSaving(false);
    }
  }


  async function deleteCheckin(
    checkin: MoodCheckin,
  ) {
    const confirmed =
      window.confirm(
        "Delete this mood check-in?",
      );

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `/api/mood-checkins/${checkin.id}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const data =
          await readJson(response);

        throw new Error(
          getMessage(
            data,
            "The check-in could not be deleted.",
          ),
        );
      }

      setMessage(
        "Mood check-in deleted."
      );

      await loadData();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "The check-in could not be deleted.",
      );
    }
  }


  return (
    <>
      <section className="mood-summary-grid">
        <article>
          <span>
            Check-ins today
          </span>

          <strong>
            {summary.entries_today}
          </strong>
        </article>

        <article>
          <span>
            Average mood
          </span>

          <strong>
            {summary.average_mood ||
              "—"}
          </strong>
        </article>

        <article>
          <span>
            Average energy
          </span>

          <strong>
            {summary.average_energy ||
              "—"}
          </strong>
        </article>

        <article>
          <span>
            Average stress
          </span>

          <strong>
            {summary.average_stress ||
              "—"}
          </strong>
        </article>
      </section>

      <section className="mood-layout">
        <form
          className="mood-form-card"
          onSubmit={submitCheckin}
        >
          <div>
            <p className="eyebrow">
              Current check-in
            </p>

            <h2>
              How are you feeling?
            </h2>

            <p className="mood-intro">
              There is no right answer.
              Choose what feels closest.
            </p>
          </div>

          <fieldset className="mood-fieldset">
            <legend>
              Overall mood
            </legend>

            <div className="mood-score-options">
              {moodOptions.map(
                (option) => (
                  <button
                    aria-pressed={
                      moodScore ===
                      option.score
                    }
                    className={
                      moodScore ===
                      option.score
                        ? "mood-option-active"
                        : ""
                    }
                    key={option.score}
                    onClick={() =>
                      setMoodScore(
                        option.score,
                      )
                    }
                    type="button"
                  >
                    <span>
                      {option.icon}
                    </span>

                    <small>
                      {option.label}
                    </small>
                  </button>
                ),
              )}
            </div>
          </fieldset>

          <label className="mood-range-field">
            <span>
              Energy level:
              <strong>
                {energyLevel}/5
              </strong>
            </span>

            <input
              max={5}
              min={1}
              onChange={(event) =>
                setEnergyLevel(
                  Number(
                    event.target.value,
                  ),
                )
              }
              type="range"
              value={energyLevel}
            />
          </label>

          <label className="mood-range-field">
            <span>
              Stress level:
              <strong>
                {stressLevel}/5
              </strong>
            </span>

            <input
              max={5}
              min={1}
              onChange={(event) =>
                setStressLevel(
                  Number(
                    event.target.value,
                  ),
                )
              }
              type="range"
              value={stressLevel}
            />
          </label>

          <fieldset className="mood-fieldset">
            <legend>
              Emotions
            </legend>

            <div className="emotion-options">
              {emotionOptions.map(
                (emotion) => (
                  <button
                    aria-pressed={
                      emotions.includes(
                        emotion,
                      )
                    }
                    className={
                      emotions.includes(
                        emotion,
                      )
                        ? "emotion-active"
                        : ""
                    }
                    key={emotion}
                    onClick={() =>
                      toggleEmotion(
                        emotion,
                      )
                    }
                    type="button"
                  >
                    {emotion}
                  </button>
                ),
              )}
            </div>
          </fieldset>

          <label className="mood-note-field">
            <span>
              Optional note
            </span>

            <textarea
              maxLength={3000}
              onChange={(event) =>
                setNote(
                  event.target.value,
                )
              }
              placeholder="What is influencing how you feel?"
              rows={5}
              value={note}
            />
          </label>

          <button
            className="button button-primary mood-save-button"
            disabled={isSaving}
            type="submit"
          >
            {isSaving
              ? "Saving..."
              : "Save check-in"}
          </button>
        </form>

        <aside className="mood-support-card">
          <p className="eyebrow">
            Gentle reflection
          </p>

          <h2>
            Notice, without judgement
          </h2>

          <p>
            Your check-ins are a private
            record to help you notice
            patterns over time.
          </p>

          <div className="mood-current-summary">
            <span aria-hidden="true">
              {moodIcon(moodScore)}
            </span>

            <div>
              <strong>
                {moodLabel(
                  moodScore,
                )}
              </strong>

              <p>
                Energy {energyLevel}/5 ·
                Stress {stressLevel}/5
              </p>
            </div>
          </div>

          <div className="mood-reminder">
            <strong>
              Important
            </strong>

            <p>
              This tool supports
              reflection but does not
              replace professional mental
              health care.
            </p>
          </div>
        </aside>
      </section>

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

      <section className="mood-history-card">
        <div>
          <p className="eyebrow">
            Mood history
          </p>

          <h2>
            Recent check-ins
          </h2>
        </div>

        {isLoading ? (
          <p>
            Loading check-ins...
          </p>
        ) : null}

        {!isLoading &&
        checkins.length === 0 ? (
          <div className="mood-empty-history">
            <h3>
              No check-ins yet
            </h3>

            <p>
              Your first mood check-in
              will appear here.
            </p>
          </div>
        ) : null}

        {checkins.length > 0 ? (
          <div className="mood-history-list">
            {checkins.map(
              (checkin) => (
                <article
                  key={checkin.id}
                >
                  <div className="mood-history-icon">
                    {moodIcon(
                      checkin.mood_score,
                    )}
                  </div>

                  <div className="mood-history-content">
                    <div className="mood-history-heading">
                      <div>
                        <h3>
                          {moodLabel(
                            checkin.mood_score,
                          )}
                        </h3>

                        <p>
                          Energy{" "}
                          {
                            checkin.energy_level
                          }
                          /5 · Stress{" "}
                          {
                            checkin.stress_level
                          }
                          /5
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          void deleteCheckin(
                            checkin,
                          )
                        }
                        type="button"
                      >
                        Delete
                      </button>
                    </div>

                    {checkin.emotions
                      .length > 0 ? (
                      <div className="mood-history-emotions">
                        {checkin.emotions.map(
                          (emotion) => (
                            <span
                              key={emotion}
                            >
                              {emotion}
                            </span>
                          ),
                        )}
                      </div>
                    ) : null}

                    {checkin.note ? (
                      <p className="mood-history-note">
                        {checkin.note}
                      </p>
                    ) : null}

                    <small>
                      {formatDate(
                        checkin.created_at,
                      )}
                    </small>
                  </div>
                </article>
              ),
            )}
          </div>
        ) : null}
      </section>
    </>
  );
}
