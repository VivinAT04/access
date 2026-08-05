"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  focusText,
} from "@/components/i18n/focus-translations";
import {
  useLanguage,
} from "@/components/language/language-provider";

import type {
  CompanionProfile,
  FocusSession,
  FocusSummary,
  Task,
} from "@/lib/types";


type TimerState =
  | "idle"
  | "running"
  | "paused"
  | "finished";


interface CompanionRewardResponse {
  already_awarded: boolean;
  xp_awarded: number;
  focus_minutes: number;
  message: string;
  profile: CompanionProfile;
}


const defaultSummary: FocusSummary = {
  sessions_today: 0,
  minutes_today: 0,
  completed_sessions: 0,
  total_minutes: 0,
};


function companionSymbol(
  companionType:
    CompanionProfile["companion_type"],
): string {
  const symbols = {
    sprout: "🌱",
    owl: "🦉",
    cloud: "☁️",
    fox: "🦊",
  };

  return symbols[companionType];
}


function companionStateLabel(
  timerState: TimerState,
  text: (
    key:
      Parameters<
        typeof focusText
      >[1],
    values?: Record<
      string,
      string | number
    >,
  ) => string,
): string {
  if (timerState === "running") {
    return text(
      "focus.state.running",
    );
  }

  if (timerState === "paused") {
    return text(
      "focus.state.paused",
    );
  }

  if (timerState === "finished") {
    return text(
      "focus.state.finished",
    );
  }

  return text(
    "focus.state.idle",
  );
}


function companionMessage(
  timerState: TimerState,
  companionName: string,
  duration: number,
  text: (
    key:
      Parameters<
        typeof focusText
      >[1],
    values?: Record<
      string,
      string | number
    >,
  ) => string,
): string {
  if (timerState === "running") {
    return text(
      "focus.message.running",
      {
        name: companionName,
      },
    );
  }

  if (timerState === "paused") {
    return text(
      "focus.message.paused",
    );
  }

  if (timerState === "finished") {
    return duration >= 45
      ? text(
          "focus.message.finishedLong",
        )
      : text(
          "focus.message.finished",
        );
  }

  return text(
    "focus.message.idle",
    {
      name: companionName,
    },
  );
}


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
  locale: string,
): string {
  return new Intl.DateTimeFormat(
    locale,
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
  const {
    locale,
  } = useLanguage();

  const text = (
    key:
      Parameters<
        typeof focusText
      >[1],
    values: Record<
      string,
      string | number
    > = {},
  ) => focusText(
    locale,
    key,
    values,
  );

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

  const [
    companion,
    setCompanion,
  ] = useState<
    CompanionProfile | null
  >(null);

  const [
    companionRewardMessage,
    setCompanionRewardMessage,
  ] = useState("");

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

  const [
    hasSavedFinishedSession,
    setHasSavedFinishedSession,
  ] = useState(false);

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
          companionResponse,
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
          fetch(
            "/api/companion/profile",
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

        const companionData =
          await readJson(
            companionResponse,
          );

        if (!sessionsResponse.ok) {
          throw new Error(
            getMessage(
              sessionsData,
              text("focus.sessionsLoadFailed"),
            ),
          );
        }

        if (!summaryResponse.ok) {
          throw new Error(
            getMessage(
              summaryData,
              text("focus.statisticsLoadFailed"),
            ),
          );
        }

        if (!tasksResponse.ok) {
          throw new Error(
            getMessage(
              tasksData,
              text("focus.tasksLoadFailed"),
            ),
          );
        }

        if (!companionResponse.ok) {
          throw new Error(
            getMessage(
              companionData,
              text("focus.companionLoadFailed"),
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

        setCompanion(
          companionData as CompanionProfile,
        );
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : text("focus.dataLoadFailed"),
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
        text("focus.enterIntention")
      );

      return;
    }

    if (
      timerState === "idle" ||
      timerState === "finished"
    ) {
      startedAtRef.current =
        new Date().toISOString();

      setHasSavedFinishedSession(
        false,
      );
    }

    setError("");
    setMessage("");
    setCompanionRewardMessage("");
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

    setHasSavedFinishedSession(
      false,
    );

    setMessage("");
    setError("");
    setCompanionRewardMessage("");
  }


  async function saveSession(
    completed: boolean,
  ) {
    if (!startedAtRef.current) {
      setError(
        text("focus.startBeforeSaving")
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
            text("focus.saveFailed"),
          ),
        );
      }

      const savedSession =
        data as FocusSession;

      if (completed) {
        const rewardResponse =
          await fetch(
            "/api/companion/reward",
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                focus_session_id:
                  savedSession.id,
              }),
            },
          );

        const rewardData =
          await readJson(
            rewardResponse,
          );

        if (rewardResponse.ok) {
          const reward =
            rewardData as
              CompanionRewardResponse;

          setCompanion(
            reward.profile,
          );

          setCompanionRewardMessage(
            reward.already_awarded
              ? reward.message
              : (
                  text(
                    "focus.reward",
                    {
                      xp:
                        reward.xp_awarded,
                      name:
                        reward.profile.companion_name,
                    },
                  )
                ),
          );
        } else {
          setCompanionRewardMessage(
            text("focus.rewardFailed"),
          );
        }
      }

      setMessage(
        completed
          ? text("focus.completedMessage")
          : text("focus.cancelledMessage"),
      );

      setTimerState(
        completed
          ? "finished"
          : "idle",
      );
      if (!completed) {
        setRemainingSeconds(
          duration * 60,
        );
      }

      setIntention("");
      setNotes("");
      setTaskId("");

      startedAtRef.current = null;

      await loadData();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : text("focus.saveFailed"),
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
        text(
          "focus.deleteConfirm",
          {
            title:
              session.intention,
          },
        ),
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
            text("focus.deleteFailed"),
          ),
        );
      }

      setMessage(
        text("focus.deleted")
      );

      await loadData();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : text("focus.deleteFailed"),
      );
    }
  }


  return (
    <>
      <section className="focus-summary-grid">
        <article>
          <span>{text("focus.sessionsToday")}</span>
          <strong>
            {summary.sessions_today}
          </strong>
        </article>

        <article>
          <span>{text("focus.minutesToday")}</span>
          <strong>
            {summary.minutes_today}
          </strong>
        </article>

        <article>
          <span>{text("focus.allSessions")}</span>
          <strong>
            {summary.completed_sessions}
          </strong>
        </article>

        <article>
          <span>{text("focus.totalMinutes")}</span>
          <strong>
            {summary.total_minutes}
          </strong>
        </article>
      </section>

      {companion ? (
        <section className="focus-companion-panel">
          <div
            aria-label={
              text(
                "focus.companionAria",
                {
                  name:
                    companion.companion_name,
                  type:
                    companion.companion_type,
                },
              )
            }
            className={
              `focus-companion-character ` +
              `focus-companion-${timerState}`
            }
            role="img"
          >
            {companionSymbol(
              companion.companion_type,
            )}
          </div>

          <div className="focus-companion-copy">
            <div className="focus-companion-heading">
              <div>
                <p className="eyebrow">
                  {text("focus.companion")}
                </p>

                <h2>
                  {companion.companion_name}
                </h2>
              </div>

              <span className="status-pill">
                {text(
                  "focus.level",
                  {
                    level:
                      companion.current_level,
                  },
                )}
              </span>
            </div>

            <strong className="focus-companion-state">
              {companionStateLabel(
                timerState,
                text,
              )}
            </strong>

            <p>
              {companionMessage(
                timerState,
                companion.companion_name,
                duration,
                text,
              )}
            </p>

            <div className="focus-companion-xp">
              <div>
                <span>
                  {companion.total_xp} XP
                </span>

                <small>
                  {
                    companion.level_progress_percentage
                  }{text(
                    "focus.xpProgress",
                    {
                      percentage:
                        companion.level_progress_percentage,
                    },
                  )}
                </small>
              </div>

              <div className="focus-companion-xp-track">
                <div
                  style={{
                    width:
                      `${companion.level_progress_percentage}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {companionRewardMessage ? (
        <section
          className="focus-companion-reward"
          role="status"
        >
          <span aria-hidden="true">
            ✨
          </span>

          <strong>
            {companionRewardMessage}
          </strong>

          {duration >= 45 ? (
            <p>
              {text(
                "focus.longBreak",
              )}
            </p>
          ) : (
            <p>
              {text(
                "focus.shortBreak",
              )}
            </p>
          )}
        </section>
      ) : null}

      <section className="focus-layout">
        <article className="focus-timer-card">
          <div>
            <p className="eyebrow">
              {text("focus.timer")}
            </p>

            <h2>
              {text("focus.oneStep")}
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
                  {text(
                    "focus.minutesShort",
                    {
                      minutes,
                    },
                  )}
                </button>
              ),
            )}
          </div>

          <label className="focus-custom-duration">
            <span>
              {text("focus.customDuration")}
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
            aria-label={text(
              "focus.remaining",
              {
                time:
                  formatTimer(
                    remainingSeconds,
                  ),
              },
            )}
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
                    ? text("focus.ready")
                    : timerState ===
                        "running"
                      ? text("focus.focusing")
                      : timerState ===
                          "paused"
                        ? text("focus.paused")
                        : text("focus.complete")}
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
                  ? text("focus.resume")
                  : text("focus.start")}
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
            !hasSavedFinishedSession ? (
              <button
                className="button button-primary focus-save-button"
                disabled={isSaving}
                onClick={() =>
                  void saveSession(true)
                }
                type="button"
              >
                {isSaving
                  ? text("common.saving")
                  : text("focus.saveCompleted")}
              </button>
            ) : (
              <button
                className="button button-primary focus-save-button"
                onClick={resetTimer}
                type="button"
              >
                {text("focus.beginAnother")}
              </button>
            )
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
              {text("focus.endEarly")}
            </button>
          ) : null}
        </article>

        <article className="focus-plan-card">
          <p className="eyebrow">
            {text("focus.plan")}
          </p>

          <h2>
            {text("focus.planQuestion")}
          </h2>

          <label>
            <span>
              {text("focus.intention")}
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
              placeholder={text("focus.intentionPlaceholder")}
              value={intention}
            />
          </label>

          <label>
            <span>
              {text("focus.linkTask")}
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
                {text("focus.noLinkedTask")}
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
              {text("focus.notes")}
            </span>

            <textarea
              maxLength={5000}
              onChange={(event) =>
                setNotes(
                  event.target.value,
                )
              }
              placeholder={text("focus.notesPlaceholder")}
              rows={6}
              value={notes}
            />
          </label>

          <div className="focus-tip">
            <strong>
              {text("focus.tipTitle")}
            </strong>

            <p>
              {text("focus.tipDescription")}
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
            {text("focus.history")}
          </p>

          <h2>
            {text("focus.recentSessions")}
          </h2>
        </div>

        {isLoading ? (
          <p>
            {text("focus.loadingSessions")}
          </p>
        ) : null}

        {!isLoading &&
        sessions.length === 0 ? (
          <div className="focus-empty-history">
            <h3>
              {text("focus.emptyTitle")}
            </h3>

            <p>
              {text("focus.emptyDescription")}
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
                      {text(
                        "focus.minutesProgress",
                        {
                          completed:
                            session.completed_minutes,
                          planned:
                            session.planned_minutes,
                        },
                      )}
                    </p>

                    <small>
                      {formatDate(
                        session.created_at,
                        locale,
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
                      {session.status ===
                      "completed"
                        ? text(
                            "focus.status.completed",
                          )
                        : text(
                            "focus.status.cancelled",
                          )}
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
