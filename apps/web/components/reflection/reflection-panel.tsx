"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  Reflection,
  ReflectionSummary,
} from "@/lib/types";


interface ReflectionForm {
  goodThing: string;
  challenge: string;
  accomplishment: string;
  note: string;
}


const emptyForm: ReflectionForm = {
  goodThing: "",
  challenge: "",
  accomplishment: "",
  note: "",
};


const emptySummary: ReflectionSummary = {
  total_reflections: 0,
  reflected_today: false,
  current_streak: 0,
};


function getLocalDate(): string {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(
    now.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    now.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


function formatDate(
  value: string,
): string {
  return new Intl.DateTimeFormat(
    "en-GB",
    {
      dateStyle: "full",
    },
  ).format(
    new Date(`${value}T12:00:00`),
  );
}


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


export function ReflectionPanel() {
  const today = useMemo(
    () => getLocalDate(),
    [],
  );

  const [form, setForm] =
    useState<ReflectionForm>(
      emptyForm,
    );

  const [
    reflections,
    setReflections,
  ] = useState<Reflection[]>([]);

  const [summary, setSummary] =
    useState<ReflectionSummary>(
      emptySummary,
    );

  const [
    editingReflectionId,
    setEditingReflectionId,
  ] = useState<string | null>(
    null,
  );

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");


  const loadData = useCallback(
    async () => {
      setIsLoading(true);
      setError("");

      try {
        const [
          reflectionsResponse,
          summaryResponse,
        ] = await Promise.all([
          fetch(
            "/api/reflections",
            {
              cache: "no-store",
            },
          ),
          fetch(
            `/api/reflections/summary?today=${today}`,
            {
              cache: "no-store",
            },
          ),
        ]);

        const reflectionsData =
          await readJson(
            reflectionsResponse,
          );

        const summaryData =
          await readJson(
            summaryResponse,
          );

        if (
          !reflectionsResponse.ok
        ) {
          throw new Error(
            getMessage(
              reflectionsData,
              "Reflection history could not be loaded.",
            ),
          );
        }

        if (!summaryResponse.ok) {
          throw new Error(
            getMessage(
              summaryData,
              "Reflection summary could not be loaded.",
            ),
          );
        }

        const loadedReflections =
          reflectionsData as Reflection[];

        setReflections(
          loadedReflections,
        );

        setSummary(
          summaryData as ReflectionSummary,
        );

        const todaysReflection =
          loadedReflections.find(
            (reflection) =>
              reflection.reflection_date
              === today,
          );

        if (todaysReflection) {
          setEditingReflectionId(
            todaysReflection.id,
          );

          setForm({
            goodThing:
              todaysReflection.good_thing,
            challenge:
              todaysReflection.challenge,
            accomplishment:
              todaysReflection.accomplishment,
            note:
              todaysReflection.note ?? "",
          });
        } else {
          setEditingReflectionId(
            null,
          );

          setForm(emptyForm);
        }
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Reflection data could not be loaded.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [today],
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


  function updateField(
    key: keyof ReflectionForm,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }


  async function saveReflection(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      !form.goodThing.trim() ||
      !form.challenge.trim() ||
      !form.accomplishment.trim()
    ) {
      setError(
        "Please answer the three short reflection prompts."
      );

      return;
    }

    setIsSaving(true);
    setError("");
    setMessage("");

    const isEditing =
      editingReflectionId !== null;

    const endpoint = isEditing
      ? `/api/reflections/${editingReflectionId}`
      : "/api/reflections";

    const payload = isEditing
      ? {
          good_thing:
            form.goodThing.trim(),
          challenge:
            form.challenge.trim(),
          accomplishment:
            form.accomplishment.trim(),
          note:
            form.note.trim() || null,
        }
      : {
          reflection_date: today,
          good_thing:
            form.goodThing.trim(),
          challenge:
            form.challenge.trim(),
          accomplishment:
            form.accomplishment.trim(),
          note:
            form.note.trim() || null,
        };

    try {
      const response = await fetch(
        endpoint,
        {
          method: isEditing
            ? "PUT"
            : "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(
            payload
          ),
        },
      );

      const data =
        await readJson(response);

      if (!response.ok) {
        throw new Error(
          getMessage(
            data,
            "The reflection could not be saved.",
          ),
        );
      }

      setMessage(
        isEditing
          ? "Today’s reflection was updated."
          : "Today’s reflection was saved.",
      );

      await loadData();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "The reflection could not be saved.",
      );
    } finally {
      setIsSaving(false);
    }
  }


  function editReflection(
    reflection: Reflection,
  ) {
    setEditingReflectionId(
      reflection.id,
    );

    setForm({
      goodThing:
        reflection.good_thing,
      challenge:
        reflection.challenge,
      accomplishment:
        reflection.accomplishment,
      note:
        reflection.note ?? "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    setMessage(
      `Editing reflection from ${formatDate(
        reflection.reflection_date,
      )}.`
    );
  }


  function returnToToday() {
    const todaysReflection =
      reflections.find(
        (reflection) =>
          reflection.reflection_date
          === today,
      );

    if (todaysReflection) {
      setEditingReflectionId(
        todaysReflection.id,
      );

      setForm({
        goodThing:
          todaysReflection.good_thing,
        challenge:
          todaysReflection.challenge,
        accomplishment:
          todaysReflection.accomplishment,
        note:
          todaysReflection.note ?? "",
      });
    } else {
      setEditingReflectionId(
        null,
      );

      setForm(emptyForm);
    }

    setMessage("");
    setError("");
  }


  async function removeReflection(
    reflection: Reflection,
  ) {
    const confirmed =
      window.confirm(
        `Delete the reflection from ${formatDate(
          reflection.reflection_date,
        )}?`,
      );

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `/api/reflections/${reflection.id}`,
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
            "The reflection could not be deleted.",
          ),
        );
      }

      setMessage(
        "Reflection deleted."
      );

      setEditingReflectionId(
        null,
      );

      setForm(emptyForm);

      await loadData();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "The reflection could not be deleted.",
      );
    }
  }


  const editingOlderReflection =
    editingReflectionId !== null &&
    reflections.some(
      (reflection) =>
        reflection.id
          === editingReflectionId &&
        reflection.reflection_date
          !== today,
    );


  return (
    <>
      <section className="reflection-summary-grid">
        <article>
          <span>Total reflections</span>

          <strong>
            {summary.total_reflections}
          </strong>
        </article>

        <article>
          <span>Current streak</span>

          <strong>
            {summary.current_streak}
          </strong>
        </article>

        <article>
          <span>Today</span>

          <strong className="reflection-today-status">
            {summary.reflected_today
              ? "Complete"
              : "Not yet"}
          </strong>
        </article>
      </section>

      <section className="reflection-layout">
        <form
          className="reflection-form-card"
          onSubmit={saveReflection}
        >
          <div className="reflection-form-heading">
            <div>
              <p className="eyebrow">
                {editingOlderReflection
                  ? "Edit reflection"
                  : "Today’s reflection"}
              </p>

              <h2>
                A few gentle thoughts
              </h2>

              <p>
                Short answers are enough.
                There is no need to write
                a full journal entry.
              </p>
            </div>

            {editingOlderReflection ? (
              <button
                className="button button-secondary"
                onClick={
                  returnToToday
                }
                type="button"
              >
                Return to today
              </button>
            ) : null}
          </div>

          <label className="reflection-field">
            <span>
              One good thing that
              happened
            </span>

            <input
              maxLength={500}
              onChange={(event) =>
                updateField(
                  "goodThing",
                  event.target.value,
                )
              }
              placeholder="A small positive moment is enough"
              required
              type="text"
              value={form.goodThing}
            />
          </label>

          <label className="reflection-field">
            <span>
              What challenged me?
            </span>

            <input
              maxLength={500}
              onChange={(event) =>
                updateField(
                  "challenge",
                  event.target.value,
                )
              }
              placeholder="What felt difficult today?"
              required
              type="text"
              value={form.challenge}
            />
          </label>

          <label className="reflection-field">
            <span>
              What did I accomplish?
            </span>

            <input
              maxLength={500}
              onChange={(event) =>
                updateField(
                  "accomplishment",
                  event.target.value,
                )
              }
              placeholder="Include even a very small step"
              required
              type="text"
              value={
                form.accomplishment
              }
            />
          </label>

          <label className="reflection-field">
            <span>
              Optional extra note
            </span>

            <textarea
              maxLength={3000}
              onChange={(event) =>
                updateField(
                  "note",
                  event.target.value,
                )
              }
              placeholder="Anything else you want to remember"
              rows={5}
              value={form.note}
            />
          </label>

          <button
            className="button button-primary reflection-save-button"
            disabled={isSaving}
            type="submit"
          >
            {isSaving
              ? "Saving..."
              : editingReflectionId
                ? "Update reflection"
                : "Save reflection"}
          </button>
        </form>

        <aside className="reflection-support-card">
          <p className="eyebrow">
            Gentle reminder
          </p>

          <h2>
            Small reflections still count
          </h2>

          <p>
            You do not need to find a
            perfect answer. A single
            sentence can help you notice
            what happened without adding
            pressure.
          </p>

          <div className="reflection-date-card">
            <span>Today</span>

            <strong>
              {formatDate(today)}
            </strong>
          </div>

          <div className="reflection-support-note">
            <strong>
              Your reflection is private
            </strong>

            <p>
              Entries are stored in your
              account and are not visible
              to other users.
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

      <section className="reflection-history-card">
        <div>
          <p className="eyebrow">
            Reflection history
          </p>

          <h2>
            Previous reflections
          </h2>
        </div>

        {isLoading ? (
          <p>
            Loading reflections...
          </p>
        ) : null}

        {!isLoading &&
        reflections.length === 0 ? (
          <div className="reflection-empty-state">
            <h3>
              No reflections yet
            </h3>

            <p>
              Your first short reflection
              will appear here.
            </p>
          </div>
        ) : null}

        {reflections.length > 0 ? (
          <div className="reflection-history-list">
            {reflections.map(
              (reflection) => (
                <article
                  key={reflection.id}
                >
                  <div className="reflection-history-date">
                    <span>
                      {new Intl.DateTimeFormat(
                        "en-GB",
                        {
                          day: "2-digit",
                        },
                      ).format(
                        new Date(
                          `${reflection.reflection_date}T12:00:00`,
                        ),
                      )}
                    </span>

                    <small>
                      {new Intl.DateTimeFormat(
                        "en-GB",
                        {
                          month: "short",
                        },
                      ).format(
                        new Date(
                          `${reflection.reflection_date}T12:00:00`,
                        ),
                      )}
                    </small>
                  </div>

                  <div className="reflection-history-content">
                    <div className="reflection-history-heading">
                      <div>
                        <h3>
                          {formatDate(
                            reflection.reflection_date,
                          )}
                        </h3>
                      </div>

                      <div className="reflection-history-actions">
                        <button
                          onClick={() =>
                            editReflection(
                              reflection,
                            )
                          }
                          type="button"
                        >
                          Edit
                        </button>

                        <button
                          className="reflection-delete-button"
                          onClick={() =>
                            void removeReflection(
                              reflection,
                            )
                          }
                          type="button"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <dl className="reflection-responses">
                      <div>
                        <dt>
                          Good thing
                        </dt>

                        <dd>
                          {
                            reflection.good_thing
                          }
                        </dd>
                      </div>

                      <div>
                        <dt>
                          Challenge
                        </dt>

                        <dd>
                          {
                            reflection.challenge
                          }
                        </dd>
                      </div>

                      <div>
                        <dt>
                          Accomplishment
                        </dt>

                        <dd>
                          {
                            reflection.accomplishment
                          }
                        </dd>
                      </div>
                    </dl>

                    {reflection.note ? (
                      <p className="reflection-history-note">
                        {reflection.note}
                      </p>
                    ) : null}
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
