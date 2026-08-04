"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  Reminder,
  ReminderSummary,
  Routine,
  Task,
} from "@/lib/types";


const emptySummary: ReminderSummary = {
  total_active: 0,
  upcoming: 0,
  overdue: 0,
  due_today: 0,
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


function messageFrom(
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


function datetimeLocalValue(
  date: Date,
): string {
  const offset =
    date.getTimezoneOffset();

  const adjusted =
    new Date(
      date.getTime()
      - offset * 60_000,
    );

  return adjusted
    .toISOString()
    .slice(0, 16);
}


function initialReminderTime() {
  const date = new Date();

  date.setHours(
    date.getHours() + 1,
  );

  date.setMinutes(0, 0, 0);

  return datetimeLocalValue(date);
}


function parseBackendDate(
  value: string,
): Date {
  /*
   * SQLite may return a UTC timestamp
   * without "Z" or an offset. In that
   * case, explicitly interpret it as UTC.
   */
  const hasTimezone =
    value.endsWith("Z") ||
    /[+-]\\d{2}:?\\d{2}$/.test(value);

  return new Date(
    hasTimezone
      ? value
      : `${value}Z`,
  );
}


function formatDateTime(
  value: string,
): string {
  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    },
  ).format(
    parseBackendDate(value),
  );
}


export function ReminderManager() {
  const [reminders, setReminders] =
    useState<Reminder[]>([]);

  const [tasks, setTasks] =
    useState<Task[]>([]);

  const [routines, setRoutines] =
    useState<Routine[]>([]);

  const [summary, setSummary] =
    useState<ReminderSummary>(
      emptySummary
    );

  const [title, setTitle] =
    useState("");

  const [reminderMessage, setReminderMessage] =
    useState("");

  const [remindAt, setRemindAt] =
    useState(
      initialReminderTime,
    );

  const [linkType, setLinkType] =
    useState<
      "none" | "task" | "routine"
    >("none");

  const [linkedId, setLinkedId] =
    useState("");

  const [editingId, setEditingId] =
    useState<string | null>(
      null
    );

  const [feedback, setFeedback] =
    useState("");

  const [error, setError] =
    useState("");

  const [permission, setPermission] =
    useState<
      NotificationPermission | "unsupported"
    >("default");


  const loadData = useCallback(
    async () => {
      setError("");

      try {
        const [
          remindersResponse,
          summaryResponse,
          tasksResponse,
          routinesResponse,
        ] = await Promise.all([
          fetch(
            "/api/reminders",
            {
              cache: "no-store",
            },
          ),
          fetch(
            "/api/reminders/summary",
            {
              cache: "no-store",
            },
          ),
          fetch(
            "/api/tasks",
            {
              cache: "no-store",
            },
          ),
          fetch(
            "/api/routines",
            {
              cache: "no-store",
            },
          ),
        ]);

        const remindersData =
          await readJson(
            remindersResponse
          );

        const summaryData =
          await readJson(
            summaryResponse
          );

        const tasksData =
          await readJson(
            tasksResponse
          );

        const routinesData =
          await readJson(
            routinesResponse
          );

        if (!remindersResponse.ok) {
          throw new Error(
            messageFrom(
              remindersData,
              "Reminders could not be loaded.",
            ),
          );
        }

        setReminders(
          remindersData as Reminder[]
        );

        setSummary(
          summaryData as ReminderSummary
        );

        setTasks(
          tasksData as Task[]
        );

        setRoutines(
          routinesData as Routine[]
        );
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Reminder data could not be loaded.",
        );
      }
    },
    [],
  );


  useEffect(() => {
    const timeoutId =
      window.setTimeout(() => {
        if (
          !("Notification" in window)
        ) {
          setPermission(
            "unsupported"
          );

          return;
        }

        setPermission(
          Notification.permission
        );
      }, 0);

    return () => {
      window.clearTimeout(
        timeoutId
      );
    };
  }, []);


  useEffect(() => {
    const timeoutId =
      window.setTimeout(() => {
        void loadData();
      }, 0);

    return () =>
      window.clearTimeout(
        timeoutId
      );
  }, [loadData]);


  useEffect(() => {
    const intervalId =
      window.setInterval(() => {
        if (
          !("Notification" in window)
          || Notification.permission
            !== "granted"
        ) {
          return;
        }

        const now = Date.now();

        for (
          const reminder of reminders
        ) {
          if (
            !reminder.is_enabled
            || reminder.is_dismissed
            || reminder.notified_at
          ) {
            continue;
          }

          const reminderTime =
            parseBackendDate(
              reminder.remind_at
            ).getTime();

          if (
            reminderTime > now
          ) {
            continue;
          }

          const notification =
            new Notification(
              reminder.title,
              {
                body:
                  reminder.message
                  ?? "You have an Aksess reminder.",
                tag:
                  `aksess-reminder-${reminder.id}`,
              },
            );

          notification.onclick = () => {
            window.focus();
            window.location.href =
              "/reminders";
            notification.close();
          };

          void fetch(
            `/api/reminders/${reminder.id}/notified`,
            {
              method: "PATCH",
            },
          ).then(
            () => loadData()
          );
        }
      }, 15_000);

    return () =>
      window.clearInterval(
        intervalId
      );
  }, [
    loadData,
    reminders,
  ]);


  const linkedOptions =
    useMemo(() => {
      if (
        linkType === "task"
      ) {
        return tasks.map(
          (task) => ({
            id: task.id,
            title: task.title,
          }),
        );
      }

      if (
        linkType === "routine"
      ) {
        return routines.map(
          (routine) => ({
            id: routine.id,
            title: routine.title,
          }),
        );
      }

      return [];
    }, [
      linkType,
      routines,
      tasks,
    ]);


  function resetForm() {
    setTitle("");
    setReminderMessage("");
    setRemindAt(
      initialReminderTime()
    );
    setLinkType("none");
    setLinkedId("");
    setEditingId(null);
  }


  async function requestNotifications() {
    if (
      !("Notification" in window)
    ) {
      setPermission(
        "unsupported"
      );

      return;
    }

    const result =
      await Notification.requestPermission();

    setPermission(result);
  }


  async function submitReminder(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!title.trim()) {
      setError(
        "Enter a reminder title."
      );

      return;
    }

    const payload = {
      title: title.trim(),
      message:
        reminderMessage.trim()
        || null,
      remind_at:
        new Date(
          remindAt
        ).toISOString(),
      task_id:
        linkType === "task"
          ? linkedId || null
          : null,
      routine_id:
        linkType === "routine"
          ? linkedId || null
          : null,
      is_enabled: true,
    };

    const response = await fetch(
      editingId
        ? `/api/reminders/${editingId}`
        : "/api/reminders",
      {
        method:
          editingId
            ? "PUT"
            : "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(
          editingId
            ? {
                title:
                  payload.title,
                message:
                  payload.message,
                remind_at:
                  payload.remind_at,
                is_enabled: true,
              }
            : payload,
        ),
      },
    );

    const data =
      await readJson(response);

    if (!response.ok) {
      setError(
        messageFrom(
          data,
          "Reminder could not be saved.",
        ),
      );

      return;
    }

    setFeedback(
      editingId
        ? "Reminder updated."
        : "Reminder created."
    );

    setError("");
    resetForm();

    await loadData();
  }


  function beginEdit(
    reminder: Reminder,
  ) {
    setEditingId(
      reminder.id
    );

    setTitle(
      reminder.title
    );

    setReminderMessage(
      reminder.message ?? ""
    );

    setRemindAt(
      datetimeLocalValue(
        new Date(
          reminder.remind_at
        )
      )
    );

    setLinkType(
      reminder.task_id
        ? "task"
        : reminder.routine_id
          ? "routine"
          : "none"
    );

    setLinkedId(
      reminder.task_id
      ?? reminder.routine_id
      ?? ""
    );
  }


  async function dismissReminder(
    reminder: Reminder,
  ) {
    await fetch(
      `/api/reminders/${reminder.id}/dismiss`,
      {
        method: "PATCH",
      },
    );

    setFeedback(
      "Reminder dismissed."
    );

    await loadData();
  }


  async function toggleReminder(
    reminder: Reminder,
  ) {
    const response = await fetch(
      `/api/reminders/${reminder.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          is_enabled:
            !reminder.is_enabled,
        }),
      },
    );

    if (!response.ok) {
      setError(
        "Reminder could not be updated."
      );

      return;
    }

    await loadData();
  }


  async function deleteReminder(
    reminder: Reminder,
  ) {
    if (
      !window.confirm(
        `Delete "${reminder.title}"?`,
      )
    ) {
      return;
    }

    await fetch(
      `/api/reminders/${reminder.id}`,
      {
        method: "DELETE",
      },
    );

    setFeedback(
      "Reminder deleted."
    );

    await loadData();
  }


  return (
    <>
      <section className="reminder-summary-grid">
        <article>
          <span>Active</span>
          <strong>
            {summary.total_active}
          </strong>
        </article>

        <article>
          <span>Due today</span>
          <strong>
            {summary.due_today}
          </strong>
        </article>

        <article>
          <span>Upcoming</span>
          <strong>
            {summary.upcoming}
          </strong>
        </article>

        <article
          className={
            summary.overdue
              ? "reminder-summary-overdue"
              : ""
          }
        >
          <span>Overdue</span>
          <strong>
            {summary.overdue}
          </strong>
        </article>
      </section>

      <section className="notification-permission-card">
        <div>
          <strong>
            Browser notifications
          </strong>

          <p>
            Notifications work while
            Aksess is open in your browser.
          </p>
        </div>

        {permission ===
        "granted" ? (
          <span className="status-pill">
            Enabled
          </span>
        ) : (
          <button
            className="button button-secondary"
            disabled={
              permission ===
              "unsupported"
            }
            onClick={() =>
              void requestNotifications()
            }
            type="button"
          >
            {permission ===
            "denied"
              ? "Notifications blocked"
              : permission ===
                  "unsupported"
                ? "Not supported"
                : "Enable notifications"}
          </button>
        )}
      </section>

      {feedback ? (
        <p className="task-message task-success">
          {feedback}
        </p>
      ) : null}

      {error ? (
        <p className="task-message task-error">
          {error}
        </p>
      ) : null}

      <section className="reminder-layout">
        <form
          className="reminder-form-card"
          onSubmit={submitReminder}
        >
          <p className="eyebrow">
            {editingId
              ? "Edit reminder"
              : "New reminder"}
          </p>

          <h2>
            {editingId
              ? "Update reminder"
              : "Remember at the right time"}
          </h2>

          <label>
            <span>Title</span>

            <input
              maxLength={200}
              onChange={(event) =>
                setTitle(
                  event.target.value
                )
              }
              placeholder="Example: Begin study routine"
              required
              value={title}
            />
          </label>

          <label>
            <span>
              Date and time
            </span>

            <input
              onChange={(event) =>
                setRemindAt(
                  event.target.value
                )
              }
              required
              type="datetime-local"
              value={remindAt}
            />
          </label>

          <label>
            <span>
              Optional message
            </span>

            <textarea
              maxLength={2000}
              onChange={(event) =>
                setReminderMessage(
                  event.target.value
                )
              }
              rows={3}
              value={
                reminderMessage
              }
            />
          </label>

          {!editingId ? (
            <>
              <label>
                <span>
                  Link reminder to
                </span>

                <select
                  onChange={(event) => {
                    setLinkType(
                      event.target
                        .value as
                        | "none"
                        | "task"
                        | "routine"
                    );

                    setLinkedId("");
                  }}
                  value={linkType}
                >
                  <option value="none">
                    No linked item
                  </option>

                  <option value="task">
                    Task
                  </option>

                  <option value="routine">
                    Routine
                  </option>
                </select>
              </label>

              {linkType !==
              "none" ? (
                <label>
                  <span>
                    Choose{" "}
                    {linkType}
                  </span>

                  <select
                    onChange={(event) =>
                      setLinkedId(
                        event.target.value
                      )
                    }
                    value={linkedId}
                  >
                    <option value="">
                      Select one
                    </option>

                    {linkedOptions.map(
                      (option) => (
                        <option
                          key={option.id}
                          value={option.id}
                        >
                          {option.title}
                        </option>
                      ),
                    )}
                  </select>
                </label>
              ) : null}
            </>
          ) : null}

          <button
            className="button button-primary"
            type="submit"
          >
            {editingId
              ? "Save changes"
              : "Create reminder"}
          </button>

          {editingId ? (
            <button
              className="button button-secondary"
              onClick={resetForm}
              type="button"
            >
              Cancel edit
            </button>
          ) : null}
        </form>

        <section className="reminder-list-card">
          <p className="eyebrow">
            Upcoming and overdue
          </p>

          <h2>
            Your reminders
          </h2>

          {reminders.length ===
          0 ? (
            <div className="reminder-empty-state">
              <h3>
                No active reminders
              </h3>

              <p>
                Create a reminder for a
                task, routine or personal
                prompt.
              </p>
            </div>
          ) : (
            <div className="reminder-list">
              {reminders.map(
                (reminder) => (
                  <article
                    className={
                      reminder.is_overdue
                        ? "reminder-item reminder-item-overdue"
                        : "reminder-item"
                    }
                    key={
                      reminder.id
                    }
                  >
                    <div className="reminder-item-heading">
                      <div>
                        <h3>
                          {
                            reminder.title
                          }
                        </h3>

                        <time>
                          {formatDateTime(
                            reminder.remind_at
                          )}
                        </time>
                      </div>

                      <span
                        className={
                          reminder.is_overdue
                            ? "status-pill reminder-overdue-pill"
                            : "status-pill"
                        }
                      >
                        {reminder.is_overdue
                          ? "Overdue"
                          : reminder.is_enabled
                            ? "Active"
                            : "Paused"}
                      </span>
                    </div>

                    {reminder.message ? (
                      <p>
                        {
                          reminder.message
                        }
                      </p>
                    ) : null}

                    <div className="reminder-actions">
                      <button
                        onClick={() =>
                          beginEdit(
                            reminder
                          )
                        }
                        type="button"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          void toggleReminder(
                            reminder
                          )
                        }
                        type="button"
                      >
                        {reminder.is_enabled
                          ? "Pause"
                          : "Enable"}
                      </button>

                      <button
                        onClick={() =>
                          void dismissReminder(
                            reminder
                          )
                        }
                        type="button"
                      >
                        Dismiss
                      </button>

                      <button
                        className="reminder-delete-button"
                        onClick={() =>
                          void deleteReminder(
                            reminder
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
          )}
        </section>
      </section>
    </>
  );
}
