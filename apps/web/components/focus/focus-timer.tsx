"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type {
  FocusSession,
  FocusSummary,
  Task,
} from "@/lib/types";


type TimerState =
  | "idle"
  | "running"
  | "paused"
  | "finished";


const defaultSummary: FocusSummary = {
  sessions_today: 0,
  minutes_today: 0,
  completed_sessions: 0,
  total_minutes: 0,
};


function formatTimer(
  totalSeconds: number,
): string {
  const minutes = Math.floor(
    totalSeconds / 60,
  );

  const seconds =
    totalSeconds % 60;

  return [
    minutes
      .toString()
      .padStart(2, "0"),
    seconds
      .toString()
      .padStart(2, "0"),
  ].join(":");
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


export function FocusTimer() {
  const [duration, setDuration] =
    useState(25);

  const [
    remainingSeconds,
    setRemainingSeconds,
  ] = useState(25 * 60);

  const [timerState, setTimerState] =
    useState<TimerState>("idle");

  const [intention, setIntention] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [taskId, setTaskId] =
    useState("");

  const [tasks, setTasks] =
    useState<Task[]>([]);

  const [sessions, setSessions] =
    useState<FocusSession[]>([]);

  const [summary, setSummary] =
    useState<FocusSummary>(
      defaultSummary,
    );

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const startedAtRef =
    useRef<string | null>(null);

  const isActive =
    timerState === "running";

  const progress = useMemo(
    () => {
      const total = duration * 60;

      if (total <= 0) {
        return 0;
      }

      return Math.min(
        100,
        Math.max(
          0,
          ((total - remainingSeconds) /
            total) *
            100,
        ),
      );
    },
    [
      duration,
      remainingSeconds,
    ],
  );


  const loadData = useCallback(
    async () => {
      setIsLoading(true);
      setError("");

      try {
        const [
          sessionsResponse,
          summaryResponse,
          tasksResponse,
        ] = await Promise.all([
          fetch(
            "/api/focus-sessions",
            {
              cache: "no-store",
            },
          ),
          fetch(
            "/api/focus-sessions/summary",
            {
              cache: "no-store",
            },
          ),
          fetch(
            "/api/tasks?status=pending",
            {
              cache: "no-store",
            },
          ),
        ]);

        const sessionsData =
          await readJson(
            sessionsResponse,
          );

        const summaryData =
          await readJson(
            summaryResponse,
          );

        const tasksData =
          await readJson(
            tasksResponse,
          );

        if (!sessionsResponse.ok) {
          throw new Error(
            getMessage(
              sessionsData,
              "Sessions could not be loaded.",
            ),
          );
        }

        if (!summaryResponse.ok) {
          throw new Error(
            getMessage(
              summaryData,
              "Statistics could not be loaded.",
            ),
          );
        }

        if (!tasksResponse.ok) {
          throw new Error(
            getMessage(
              tasksData,
              "Tasks could not be loaded.",
            ),
          );
        }

        setSessions(
          sessionsData as FocusSession[],
        );

        setSummary(
          summaryData as FocusSummary,
        );

        setTasks(
          tasksData as Task[],
        );
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Focus data could not be loaded.",
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


  useEffect(() => {
    if (!isActive) {
      return;
    }

    const intervalId =
      window.setInterval(() => {
        setRemainingSeconds(
          (current) => {
            if (current <= 1) {
              window.clearInterval(
                intervalId,
              );

              setTimerState(
                "finished",
              );

              return 0;
            }

            return current - 1;
          },
        );
      }, 1000);

    return () => {
      window.clearInterval(
        intervalId,
      );
    };
  }, [isActive]);


  function chooseDuration(
    minutes: number,
  ) {
    if (
      timerState === "running" ||
      timerState === "paused"
    ) {
      return;
    }

    setDuration(minutes);
    setRemainingSeconds(
      minutes * 60,
    );
    setTimerState("idle");
  }


  function startTimer() {
    const cleanedIntention =
      intention.trim();

    if (!cleanedIntention) {
      setError(
        "Enter what you want to focus on."
      );

      return;
    }

    if (
      timerState === "idle" ||
      timerState === "finished"
    ) {
      startedAtRef.current =
        new Date().toISOString();
    }

    setError("");
    setMessage("");
    setTimerState("running");
  }


  function pauseTimer() {
    setTimerState("paused");
  }


  function resetTimer() {
    setTimerState("idle");

    setRemainingSeconds(
      duration * 60,
    );

    startedAtRef.current = null;

    setMessage("");
    setError("");
  }


  async function saveSession(
    completed: boolean,
  ) {
    if (!startedAtRef.current) {
      setError(
        "Start the timer before saving the session."
      );

      return;
    }

    const elapsedSeconds =
      duration * 60 -
      remainingSeconds;

    const completedMinutes =
      completed
        ? duration
        : Math.max(
            1,
            Math.round(
              elapsedSeconds / 60,
            ),
          );

    setIsSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        "/api/focus-sessions",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            task_id:
              taskId || null,
            intention:
              intention.trim(),
            notes:
              notes.trim() || null,
            planned_minutes:
              duration,
            completed_minutes:
              Math.min(
                completedMinutes,
                duration,
              ),
            status:
              completed
                ? "completed"
                : "cancelled",
            started_at:
              startedAtRef.current,
            completed_at:
              new Date().toISOString(),
          }),
        },
      );

      const data =
        await readJson(response);

      if (!response.ok) {
        throw new Error(
          getMessage(
            data,
            "The session could not be saved.",
          ),
        );
      }

      setMessage(
        completed
          ? "Focus session completed."
          : "Focus session saved as cancelled.",
      );

      setTimerState("idle");
      setRemainingSeconds(
        duration * 60,
      );

      setIntention("");
      setNotes("");
      setTaskId("");

      startedAtRef.current = null;

      await loadData();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "The session could not be saved.",
      );
    } finally {
      setIsSaving(false);
    }
  }


  async function deleteSession(
    session: FocusSession,
  ) {
    const confirmed =
      window.confirm(
        `Delete "${session.intention}"?`,
      );

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `/api/focus-sessions/${session.id}`,
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
            "The session could not be deleted.",
          ),
        );
      }

      setMessage(
        "Focus session deleted."
      );

      await loadData();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "The session could not be deleted.",
      );
    }
  }


  return (
    <>
      <section className="focus-summary-grid">
        <article>
          <span>Sessions today</span>
          <strong>
            {summary.sessions_today}
          </strong>
        </article>

        <article>
          <span>Minutes today</span>
          <strong>
            {summary.minutes_today}
          </strong>
        </article>

        <article>
          <span>All sessions</span>
          <strong>
            {summary.completed_sessions}
          </strong>
        </article>

        <article>
          <span>Total minutes</span>
          <strong>
            {summary.total_minutes}
          </strong>
        </article>
      </section>

      <section className="focus-layout">
        <article className="focus-timer-card">
          <div>
            <p className="eyebrow">
              Focus timer
            </p>

            <h2>
              One step at a time
            </h2>
          </div>

          <div className="focus-presets">
            {[25, 45, 60].map(
              (minutes) => (
                <button
                  className={
                    duration === minutes
                      ? "focus-preset-active"
                      : ""
                  }
                  disabled={
                    timerState ===
                      "running" ||
                    timerState ===
                      "paused"
                  }
                  key={minutes}
                  onClick={() =>
                    chooseDuration(
                      minutes,
                    )
                  }
                  type="button"
                >
                  {minutes} min
                </button>
              ),
            )}
          </div>

          <label className="focus-custom-duration">
            <span>
              Custom duration
            </span>

            <input
              disabled={
                timerState ===
                  "running" ||
                timerState ===
                  "paused"
              }
              max={240}
              min={1}
              onChange={(event) =>
                chooseDuration(
                  Number(
                    event.target.value,
                  ),
                )
              }
              type="number"
              value={duration}
            />
          </label>

          <div
            aria-label={`${formatTimer(
              remainingSeconds,
            )} remaining`}
            className="focus-clock"
          >
            <div
              aria-hidden="true"
              className="focus-progress"
              style={{
                "--focus-progress":
                  `${progress}%`,
              } as React.CSSProperties}
            >
              <div>
                <strong>
                  {formatTimer(
                    remainingSeconds,
                  )}
                </strong>

                <span>
                  {timerState === "idle"
                    ? "Ready"
                    : timerState ===
                        "running"
                      ? "Focusing"
                      : timerState ===
                          "paused"
                        ? "Paused"
                        : "Complete"}
                </span>
              </div>
            </div>
          </div>

          <div className="focus-controls">
            {timerState !==
              "running" ? (
              <button
                className="button button-primary"
                onClick={startTimer}
                type="button"
              >
                {timerState ===
                "paused"
                  ? "Resume"
                  : "Start focus"}
              </button>
            ) : (
              <button
                className="button button-secondary"
                onClick={pauseTimer}
                type="button"
              >
                Pause
              </button>
            )}

            <button
              className="button button-secondary"
              onClick={resetTimer}
              type="button"
            >
              Reset
            </button>
          </div>

          {timerState ===
          "finished" ? (
            <button
              className="button button-primary focus-save-button"
              disabled={isSaving}
              onClick={() =>
                void saveSession(true)
              }
              type="button"
            >
              {isSaving
                ? "Saving..."
                : "Save completed session"}
            </button>
          ) : null}

          {(
            timerState === "paused" ||
            timerState === "running"
          ) ? (
            <button
              className="focus-cancel-session"
              disabled={isSaving}
              onClick={() =>
                void saveSession(false)
              }
              type="button"
            >
              End session early
            </button>
          ) : null}
        </article>

        <article className="focus-plan-card">
          <p className="eyebrow">
            Session plan
          </p>

          <h2>
            What will you focus on?
          </h2>

          <label>
            <span>
              Focus intention
            </span>

            <input
              disabled={
                timerState ===
                  "running"
              }
              maxLength={250}
              onChange={(event) =>
                setIntention(
                  event.target.value,
                )
              }
              placeholder="Example: Finish the results section"
              value={intention}
            />
          </label>

          <label>
            <span>
              Link a task
            </span>

            <select
              disabled={
                timerState ===
                  "running"
              }
              onChange={(event) =>
                setTaskId(
                  event.target.value,
                )
              }
              value={taskId}
            >
              <option value="">
                No linked task
              </option>

              {tasks.map((task) => (
                <option
                  key={task.id}
                  value={task.id}
                >
                  {task.title}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>
              Session notes
            </span>

            <textarea
              maxLength={5000}
              onChange={(event) =>
                setNotes(
                  event.target.value,
                )
              }
              placeholder="Write the next small step or remove distractions"
              rows={6}
              value={notes}
            />
          </label>

          <div className="focus-tip">
            <strong>
              Gentle focus tip
            </strong>

            <p>
              Choose one clear outcome.
              You can always start another
              session afterwards.
            </p>
          </div>
        </article>
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

      <section className="focus-history-card">
        <div>
          <p className="eyebrow">
            Session history
          </p>

          <h2>
            Recent focus sessions
          </h2>
        </div>

        {isLoading ? (
          <p>
            Loading sessions...
          </p>
        ) : null}

        {!isLoading &&
        sessions.length === 0 ? (
          <div className="focus-empty-history">
            <h3>
              No focus sessions yet
            </h3>

            <p>
              Complete your first timer
              session and it will appear
              here.
            </p>
          </div>
        ) : null}

        {sessions.length > 0 ? (
          <div className="focus-history-list">
            {sessions.map(
              (session) => (
                <article
                  key={session.id}
                >
                  <div>
                    <h3>
                      {session.intention}
                    </h3>

                    <p>
                      {
                        session.completed_minutes
                      }{" "}
                      of{" "}
                      {
                        session.planned_minutes
                      }{" "}
                      minutes
                    </p>

                    <small>
                      {formatDate(
                        session.created_at,
                      )}
                    </small>
                  </div>

                  <div className="focus-history-actions">
                    <span
                      className={
                        session.status ===
                        "completed"
                          ? "focus-session-completed"
                          : "focus-session-cancelled"
                      }
                    >
                      {session.status}
                    </span>

                    <button
                      onClick={() =>
                        void deleteSession(
                          session,
                        )
                      }
                      type="button"
                    >
                      Delete
                    </button>
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
