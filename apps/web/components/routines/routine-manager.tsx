"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

import type {
  Routine,
  RoutineCategory,
  RoutineRun,
  RoutineSummary,
} from "@/lib/types";


interface DraftStep {
  title: string;
  estimated_minutes: string;
}


const emptySummary: RoutineSummary = {
  total_routines: 0,
  active_runs_today: 0,
  completed_runs_today: 0,
  total_completed_runs: 0,
};


function localDate(): string {
  const now = new Date();

  return [
    now.getFullYear(),
    String(
      now.getMonth() + 1,
    ).padStart(2, "0"),
    String(
      now.getDate(),
    ).padStart(2, "0"),
  ].join("-");
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


export function RoutineManager() {
  const [routines, setRoutines] =
    useState<Routine[]>([]);

  const [runs, setRuns] =
    useState<RoutineRun[]>([]);

  const [summary, setSummary] =
    useState<RoutineSummary>(
      emptySummary,
    );

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [category, setCategory] =
    useState<RoutineCategory>(
      "custom",
    );

  const [draftSteps, setDraftSteps] =
    useState<DraftStep[]>([
      {
        title: "",
        estimated_minutes: "",
      },
    ]);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [isSaving, setIsSaving] =
    useState(false);


  const loadData = useCallback(
    async () => {
      try {
        const [
          routinesResponse,
          runsResponse,
          summaryResponse,
        ] = await Promise.all([
          fetch(
            "/api/routines",
            {
              cache: "no-store",
            },
          ),
          fetch(
            "/api/routines/runs",
            {
              cache: "no-store",
            },
          ),
          fetch(
            `/api/routines/summary?today=${localDate()}`,
            {
              cache: "no-store",
            },
          ),
        ]);

        const routinesData =
          await readJson(
            routinesResponse,
          );

        const runsData =
          await readJson(
            runsResponse,
          );

        const summaryData =
          await readJson(
            summaryResponse,
          );

        if (!routinesResponse.ok) {
          throw new Error(
            getMessage(
              routinesData,
              "Routines could not be loaded.",
            ),
          );
        }

        if (!runsResponse.ok) {
          throw new Error(
            getMessage(
              runsData,
              "Routine history could not be loaded.",
            ),
          );
        }

        setRoutines(
          routinesData as Routine[],
        );

        setRuns(
          runsData as RoutineRun[],
        );

        setSummary(
          summaryData as RoutineSummary,
        );
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Routine data could not be loaded.",
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


  function updateDraftStep(
    index: number,
    field: keyof DraftStep,
    value: string,
  ) {
    setDraftSteps(
      (current) =>
        current.map(
          (step, stepIndex) =>
            stepIndex === index
              ? {
                  ...step,
                  [field]: value,
                }
              : step,
        ),
    );
  }


  function addDraftStep() {
    setDraftSteps(
      (current) => [
        ...current,
        {
          title: "",
          estimated_minutes: "",
        },
      ],
    );
  }


  function removeDraftStep(
    index: number,
  ) {
    setDraftSteps(
      (current) =>
        current.filter(
          (_, stepIndex) =>
            stepIndex !== index,
        ),
    );
  }


  async function createRoutine(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!title.trim()) {
      setError(
        "Enter a routine title."
      );

      return;
    }

    const steps = draftSteps
      .filter(
        (step) =>
          step.title.trim(),
      )
      .map(
        (step, index) => ({
          title:
            step.title.trim(),
          description: null,
          position: index,
          estimated_minutes:
            step.estimated_minutes
              ? Number(
                  step.estimated_minutes,
                )
              : null,
        }),
      );

    setIsSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        "/api/routines",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            title: title.trim(),
            description:
              description.trim()
              || null,
            category,
            steps,
          }),
        },
      );

      const data =
        await readJson(response);

      if (!response.ok) {
        throw new Error(
          getMessage(
            data,
            "Routine could not be created.",
          ),
        );
      }

      setTitle("");
      setDescription("");
      setCategory("custom");

      setDraftSteps([
        {
          title: "",
          estimated_minutes: "",
        },
      ]);

      setMessage(
        "Routine created."
      );

      await loadData();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Routine could not be created.",
      );
    } finally {
      setIsSaving(false);
    }
  }


  async function startRoutine(
    routine: Routine,
  ) {
    setError("");
    setMessage("");

    const response = await fetch(
      `/api/routines/${routine.id}/start?run_date=${localDate()}`,
      {
        method: "POST",
      },
    );

    const data =
      await readJson(response);

    if (!response.ok) {
      setError(
        getMessage(
          data,
          "Routine could not be started.",
        ),
      );

      return;
    }

    setMessage(
      `${routine.title} started.`
    );

    await loadData();
  }


  async function toggleRunStep(
    runStepId: string,
    completed: boolean,
  ) {
    const response = await fetch(
      `/api/routines/run-steps/${runStepId}/complete?completed=${completed}`,
      {
        method: "PATCH",
      },
    );

    const data =
      await readJson(response);

    if (!response.ok) {
      setError(
        getMessage(
          data,
          "Routine step could not be updated.",
        ),
      );

      return;
    }

    setMessage(
      completed
        ? "Routine step completed."
        : "Routine step reopened.",
    );

    await loadData();
  }


  async function duplicateRoutine(
    routine: Routine,
  ) {
    const response = await fetch(
      `/api/routines/${routine.id}/duplicate`,
      {
        method: "POST",
      },
    );

    const data =
      await readJson(response);

    if (!response.ok) {
      setError(
        getMessage(
          data,
          "Routine could not be duplicated.",
        ),
      );

      return;
    }

    setMessage(
      "Routine duplicated."
    );

    await loadData();
  }


  async function deleteRoutine(
    routine: Routine,
  ) {
    if (
      !window.confirm(
        `Delete "${routine.title}"?`,
      )
    ) {
      return;
    }

    const response = await fetch(
      `/api/routines/${routine.id}`,
      {
        method: "DELETE",
      },
    );

    if (!response.ok) {
      const data =
        await readJson(response);

      setError(
        getMessage(
          data,
          "Routine could not be deleted.",
        ),
      );

      return;
    }

    setMessage(
      "Routine deleted."
    );

    await loadData();
  }


  return (
    <>
      <section className="routine-summary-grid">
        <article>
          <span>Templates</span>
          <strong>
            {summary.total_routines}
          </strong>
        </article>

        <article>
          <span>Active today</span>
          <strong>
            {summary.active_runs_today}
          </strong>
        </article>

        <article>
          <span>Completed today</span>
          <strong>
            {summary.completed_runs_today}
          </strong>
        </article>

        <article>
          <span>Completed overall</span>
          <strong>
            {summary.total_completed_runs}
          </strong>
        </article>
      </section>

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

      <section className="routine-layout">
        <form
          className="routine-create-card"
          onSubmit={createRoutine}
        >
          <p className="eyebrow">
            New routine template
          </p>

          <h2>
            Build a repeatable routine
          </h2>

          <label>
            <span>Routine name</span>

            <input
              onChange={(event) =>
                setTitle(
                  event.target.value,
                )
              }
              placeholder="Example: Morning routine"
              value={title}
            />
          </label>

          <label>
            <span>Category</span>

            <select
              onChange={(event) =>
                setCategory(
                  event.target
                    .value as RoutineCategory,
                )
              }
              value={category}
            >
              <option value="morning">
                Morning
              </option>

              <option value="study">
                Study
              </option>

              <option value="work">
                Work
              </option>

              <option value="evening">
                Evening
              </option>

              <option value="custom">
                Custom
              </option>
            </select>
          </label>

          <label>
            <span>Description</span>

            <textarea
              onChange={(event) =>
                setDescription(
                  event.target.value,
                )
              }
              rows={3}
              value={description}
            />
          </label>

          <div className="routine-draft-steps">
            <strong>
              Routine steps
            </strong>

            {draftSteps.map(
              (step, index) => (
                <div
                  className="routine-draft-step"
                  key={index}
                >
                  <input
                    onChange={(event) =>
                      updateDraftStep(
                        index,
                        "title",
                        event.target.value,
                      )
                    }
                    placeholder={`Step ${index + 1}`}
                    value={step.title}
                  />

                  <input
                    min={1}
                    onChange={(event) =>
                      updateDraftStep(
                        index,
                        "estimated_minutes",
                        event.target.value,
                      )
                    }
                    placeholder="Minutes"
                    type="number"
                    value={
                      step.estimated_minutes
                    }
                  />

                  <button
                    disabled={
                      draftSteps.length
                      === 1
                    }
                    onClick={() =>
                      removeDraftStep(
                        index,
                      )
                    }
                    type="button"
                  >
                    Remove
                  </button>
                </div>
              ),
            )}

            <button
              className="button button-secondary"
              onClick={addDraftStep}
              type="button"
            >
              Add another step
            </button>
          </div>

          <button
            className="button button-primary"
            disabled={isSaving}
            type="submit"
          >
            {isSaving
              ? "Creating..."
              : "Create routine"}
          </button>
        </form>

        <section className="routine-template-card">
          <p className="eyebrow">
            Reusable templates
          </p>

          <h2>
            Your routines
          </h2>

          <div className="routine-template-list">
            {routines.map(
              (routine) => (
                <article
                  key={routine.id}
                >
                  <div className="routine-template-heading">
                    <div>
                      <span>
                        {routine.category}
                      </span>

                      <h3>
                        {routine.title}
                      </h3>

                      <p>
                        {
                          routine.steps
                            .length
                        }{" "}
                        steps
                      </p>
                    </div>

                    <div>
                      <button
                        onClick={() =>
                          void startRoutine(
                            routine,
                          )
                        }
                        type="button"
                      >
                        Start today
                      </button>

                      <button
                        onClick={() =>
                          void duplicateRoutine(
                            routine,
                          )
                        }
                        type="button"
                      >
                        Duplicate
                      </button>

                      <button
                        className="routine-delete"
                        onClick={() =>
                          void deleteRoutine(
                            routine,
                          )
                        }
                        type="button"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <ol>
                    {routine.steps.map(
                      (step) => (
                        <li
                          key={step.id}
                        >
                          <span>
                            {step.title}
                          </span>

                          {step.estimated_minutes ? (
                            <small>
                              {
                                step.estimated_minutes
                              }{" "}
                              min
                            </small>
                          ) : null}
                        </li>
                      ),
                    )}
                  </ol>
                </article>
              ),
            )}
          </div>
        </section>
      </section>

      <section className="routine-runs-card">
        <p className="eyebrow">
          Today and history
        </p>

        <h2>
          Routine progress
        </h2>

        <div className="routine-run-list">
          {runs.map((run) => (
            <article key={run.id}>
              <div className="routine-run-heading">
                <div>
                  <h3>
                    {run.routine_title}
                  </h3>

                  <p>
                    {run.completed_steps} of{" "}
                    {run.total_steps} completed
                  </p>
                </div>

                <strong>
                  {run.progress_percentage}%
                </strong>
              </div>

              <div className="routine-progress-track">
                <div
                  style={{
                    width:
                      `${run.progress_percentage}%`,
                  }}
                />
              </div>

              <div className="routine-run-steps">
                {run.steps.map(
                  (step) => (
                    <button
                      className={
                        step.is_completed
                          ? "routine-run-step routine-run-step-completed"
                          : "routine-run-step"
                      }
                      key={step.id}
                      onClick={() =>
                        void toggleRunStep(
                          step.id,
                          !step.is_completed,
                        )
                      }
                      type="button"
                    >
                      <span>
                        {step.is_completed
                          ? "✓"
                          : ""}
                      </span>

                      <strong>
                        {step.title}
                      </strong>
                    </button>
                  ),
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
