"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  Task,
  TaskInput,
  TaskPriority,
  TaskStatus,
  TaskSummary,
} from "@/lib/types";


type StatusFilter =
  | "all"
  | TaskStatus;

type PriorityFilter =
  | "all"
  | TaskPriority;


const emptyForm: TaskInput = {
  title: "",
  description: null,
  priority: "medium",
  status: "pending",
  due_date: null,
};


function toDateTimeLocal(
  value: string | null,
): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset();

  const localDate = new Date(
    date.getTime() - offset * 60_000,
  );

  return localDate
    .toISOString()
    .slice(0, 16);
}


function toApiDate(
  value: string,
): string | null {
  if (!value) {
    return null;
  }

  return new Date(value).toISOString();
}


function formatDate(
  value: string | null,
): string {
  if (!value) {
    return "No due date";
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(new Date(value));
}


function isOverdue(task: Task): boolean {
  if (
    !task.due_date ||
    task.is_completed
  ) {
    return false;
  }

  return (
    new Date(task.due_date).getTime() <
    Date.now()
  );
}


async function readJsonResponse(
  response: Response,
): Promise<unknown> {
  const responseText =
    await response.text();

  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(responseText);
  } catch {
    return {
      message:
        response.ok
          ? "The server returned an invalid response."
          : `Request failed with status ${response.status}.`,
    };
  }
}


function getErrorMessage(
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
    "detail" in data
  ) {
    if (typeof data.detail === "string") {
      return data.detail;
    }

    if (Array.isArray(data.detail)) {
      return data.detail
        .map((item) => {
          if (
            typeof item === "object" &&
            item !== null &&
            "msg" in item &&
            typeof item.msg === "string"
          ) {
            return item.msg;
          }

          return null;
        })
        .filter(Boolean)
        .join(" ");
    }
  }

  return fallback;
}


export function TaskManager() {
  const [tasks, setTasks] =
    useState<Task[]>([]);

  const [summary, setSummary] =
    useState<TaskSummary>({
      total: 0,
      pending: 0,
      in_progress: 0,
      completed: 0,
      overdue: 0,
    });

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");

  const [priorityFilter, setPriorityFilter] =
    useState<PriorityFilter>("all");

  const [search, setSearch] =
    useState("");

  const [form, setForm] =
    useState<TaskInput>(emptyForm);

  const [editingTaskId, setEditingTaskId] =
    useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");


  const loadTasks = useCallback(
    async () => {
      setIsLoading(true);
      setError("");

      const query = new URLSearchParams();

      if (statusFilter !== "all") {
        query.set(
          "status",
          statusFilter,
        );
      }

      if (priorityFilter !== "all") {
        query.set(
          "priority",
          priorityFilter,
        );
      }

      const url = query.size
        ? `/api/tasks?${query.toString()}`
        : "/api/tasks";

      try {
        const [
          tasksResponse,
          summaryResponse,
        ] = await Promise.all([
          fetch(url, {
            cache: "no-store",
          }),
          fetch("/api/tasks/summary", {
            cache: "no-store",
          }),
        ]);

        const tasksData =
          (await readJsonResponse(
            tasksResponse,
          )) as unknown;

        const summaryData =
          (await readJsonResponse(
            summaryResponse,
          )) as unknown;

        if (!tasksResponse.ok) {
          throw new Error(
            getErrorMessage(
              tasksData,
              "Tasks could not be loaded.",
            ),
          );
        }

        if (!summaryResponse.ok) {
          throw new Error(
            getErrorMessage(
              summaryData,
              "Task summary could not be loaded.",
            ),
          );
        }

        setTasks(tasksData as Task[]);
        setSummary(summaryData as TaskSummary);
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Tasks could not be loaded.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [
      priorityFilter,
      statusFilter,
    ],
  );


  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadTasks();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadTasks]);


  const visibleTasks = useMemo(
    () => {
      const cleanedSearch =
        search.trim().toLowerCase();

      if (!cleanedSearch) {
        return tasks;
      }

      return tasks.filter((task) => {
        const searchableText = [
          task.title,
          task.description ?? "",
          task.priority,
          task.status,
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(
          cleanedSearch,
        );
      });
    },
    [
      search,
      tasks,
    ],
  );


  function openCreateForm() {
    setEditingTaskId(null);
    setForm(emptyForm);
    setError("");
    setMessage("");
    setIsFormOpen(true);
  }


  function openEditForm(task: Task) {
    setEditingTaskId(task.id);

    setForm({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      due_date: toDateTimeLocal(
        task.due_date,
      ),
    });

    setError("");
    setMessage("");
    setIsFormOpen(true);
  }


  function closeForm() {
    if (isSaving) {
      return;
    }

    setIsFormOpen(false);
    setEditingTaskId(null);
    setForm(emptyForm);
  }


  function updateForm<
    Key extends keyof TaskInput,
  >(
    key: Key,
    value: TaskInput[Key],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }


  async function submitTask(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const cleanedTitle =
      form.title.trim();

    if (!cleanedTitle) {
      setError(
        "Enter a title for the task.",
      );

      return;
    }

    setIsSaving(true);
    setError("");
    setMessage("");

    const payload: TaskInput = {
      ...form,
      title: cleanedTitle,
      description:
        form.description?.trim() ||
        null,
      due_date: toApiDate(
        form.due_date ?? "",
      ),
    };

    const requestUrl = editingTaskId
      ? `/api/tasks/${editingTaskId}`
      : "/api/tasks";

    const requestMethod = editingTaskId
      ? "PUT"
      : "POST";

    try {
      const response = await fetch(
        requestUrl,
        {
          method: requestMethod,
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const data =
        (await response.json()) as unknown;

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            data,
            "The task could not be saved.",
          ),
        );
      }

      setMessage(
        editingTaskId
          ? "Task updated."
          : "Task created.",
      );

      setIsFormOpen(false);
      setEditingTaskId(null);
      setForm(emptyForm);

      await loadTasks();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "The task could not be saved.",
      );
    } finally {
      setIsSaving(false);
    }
  }


  async function toggleTask(
    task: Task,
  ) {
    setError("");
    setMessage("");

    try {
      const completed =
        !task.is_completed;

      const response = await fetch(
        `/api/tasks/${task.id}/complete?completed=${completed}`,
        {
          method: "PATCH",
        },
      );

      const data =
        (await response.json()) as unknown;

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            data,
            "The task could not be updated.",
          ),
        );
      }

      setMessage(
        completed
          ? "Task completed."
          : "Task reopened.",
      );

      await loadTasks();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "The task could not be updated.",
      );
    }
  }


  async function removeTask(
    task: Task,
  ) {
    const confirmed = window.confirm(
      `Delete "${task.title}"?`,
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `/api/tasks/${task.id}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const data =
          (await response.json()) as unknown;

        throw new Error(
          getErrorMessage(
            data,
            "The task could not be deleted.",
          ),
        );
      }

      setMessage("Task deleted.");

      await loadTasks();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "The task could not be deleted.",
      );
    }
  }


  return (
    <>
      <section className="task-summary-grid">
        <article>
          <span>Total tasks</span>
          <strong>{summary.total}</strong>
        </article>

        <article>
          <span>To do</span>
          <strong>{summary.pending}</strong>
        </article>

        <article>
          <span>In progress</span>
          <strong>
            {summary.in_progress}
          </strong>
        </article>

        <article>
          <span>Completed</span>
          <strong>
            {summary.completed}
          </strong>
        </article>

        <article
          className={
            summary.overdue > 0
              ? "summary-overdue"
              : ""
          }
        >
          <span>Overdue</span>
          <strong>{summary.overdue}</strong>
        </article>
      </section>

      <section className="task-workspace">
        <div className="task-toolbar">
          <div>
            <p className="eyebrow">
              Executive-function planner
            </p>

            <h2>Your tasks</h2>
          </div>

          <button
            className="button button-primary"
            onClick={openCreateForm}
            type="button"
          >
            Add task
          </button>
        </div>

        <div className="task-filters">
          <label>
            <span>Search</span>

            <input
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search tasks"
              type="search"
              value={search}
            />
          </label>

          <label>
            <span>Status</span>

            <select
              onChange={(event) =>
                setStatusFilter(
                  event.target
                    .value as StatusFilter,
                )
              }
              value={statusFilter}
            >
              <option value="all">
                All statuses
              </option>

              <option value="pending">
                To do
              </option>

              <option value="in-progress">
                In progress
              </option>

              <option value="completed">
                Completed
              </option>
            </select>
          </label>

          <label>
            <span>Priority</span>

            <select
              onChange={(event) =>
                setPriorityFilter(
                  event.target
                    .value as PriorityFilter,
                )
              }
              value={priorityFilter}
            >
              <option value="all">
                All priorities
              </option>

              <option value="low">
                Low
              </option>

              <option value="medium">
                Medium
              </option>

              <option value="high">
                High
              </option>

              <option value="urgent">
                Urgent
              </option>
            </select>
          </label>
        </div>

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

        {isLoading ? (
          <div
            className="task-empty-state"
            role="status"
          >
            Loading your tasks...
          </div>
        ) : null}

        {!isLoading &&
        visibleTasks.length === 0 ? (
          <div className="task-empty-state">
            <span aria-hidden="true">
              ✓
            </span>

            <h3>No tasks found</h3>

            <p>
              Add your first task or adjust
              the current filters.
            </p>

            <button
              className="button button-primary"
              onClick={openCreateForm}
              type="button"
            >
              Create a task
            </button>
          </div>
        ) : null}

        {!isLoading &&
        visibleTasks.length > 0 ? (
          <div className="task-list">
            {visibleTasks.map((task) => (
              <article
                className={`task-card ${
                  task.is_completed
                    ? "task-card-completed"
                    : ""
                }`}
                key={task.id}
              >
                <button
                  aria-label={
                    task.is_completed
                      ? `Reopen ${task.title}`
                      : `Complete ${task.title}`
                  }
                  className="task-complete-button"
                  onClick={() =>
                    void toggleTask(task)
                  }
                  type="button"
                >
                  {task.is_completed
                    ? "✓"
                    : ""}
                </button>

                <div className="task-card-content">
                  <div className="task-card-heading">
                    <div>
                      <h3>{task.title}</h3>

                      <div className="task-badges">
                        <span
                          className={`task-priority task-priority-${task.priority}`}
                        >
                          {task.priority}
                        </span>

                        <span className="task-status">
                          {task.status ===
                          "in-progress"
                            ? "In progress"
                            : task.status ===
                                "pending"
                              ? "To do"
                              : "Completed"}
                        </span>

                        {isOverdue(task) ? (
                          <span className="task-overdue">
                            Overdue
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="task-card-actions">
                      <button
                        onClick={() =>
                          openEditForm(task)
                        }
                        type="button"
                      >
                        Edit
                      </button>

                      <button
                        className="task-delete-button"
                        onClick={() =>
                          void removeTask(task)
                        }
                        type="button"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {task.description ? (
                    <p>
                      {task.description}
                    </p>
                  ) : null}

                  <small>
                    Due:{" "}
                    {formatDate(
                      task.due_date,
                    )}
                  </small>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>

      {isFormOpen ? (
        <div
          aria-labelledby="task-form-title"
          aria-modal="true"
          className="task-modal-backdrop"
          role="dialog"
        >
          <form
            className="task-form-card"
            onSubmit={submitTask}
          >
            <div className="task-form-heading">
              <div>
                <p className="eyebrow">
                  {editingTaskId
                    ? "Update task"
                    : "New task"}
                </p>

                <h2 id="task-form-title">
                  {editingTaskId
                    ? "Edit task"
                    : "Add a task"}
                </h2>
              </div>

              <button
                aria-label="Close task form"
                className="task-modal-close"
                onClick={closeForm}
                type="button"
              >
                ×
              </button>
            </div>

            <label className="task-form-field">
              <span>Task title</span>

              <input
                autoFocus
                maxLength={200}
                onChange={(event) =>
                  updateForm(
                    "title",
                    event.target.value,
                  )
                }
                placeholder="What needs to be done?"
                required
                type="text"
                value={form.title}
              />
            </label>

            <label className="task-form-field">
              <span>Description</span>

              <textarea
                maxLength={5000}
                onChange={(event) =>
                  updateForm(
                    "description",
                    event.target.value,
                  )
                }
                placeholder="Add helpful notes or the next small step"
                rows={5}
                value={
                  form.description ?? ""
                }
              />
            </label>

            <div className="task-form-row">
              <label className="task-form-field">
                <span>Priority</span>

                <select
                  onChange={(event) =>
                    updateForm(
                      "priority",
                      event.target
                        .value as TaskPriority,
                    )
                  }
                  value={form.priority}
                >
                  <option value="low">
                    Low
                  </option>

                  <option value="medium">
                    Medium
                  </option>

                  <option value="high">
                    High
                  </option>

                  <option value="urgent">
                    Urgent
                  </option>
                </select>
              </label>

              <label className="task-form-field">
                <span>Status</span>

                <select
                  onChange={(event) =>
                    updateForm(
                      "status",
                      event.target
                        .value as TaskStatus,
                    )
                  }
                  value={form.status}
                >
                  <option value="pending">
                    To do
                  </option>

                  <option value="in-progress">
                    In progress
                  </option>

                  <option value="completed">
                    Completed
                  </option>
                </select>
              </label>
            </div>

            <label className="task-form-field">
              <span>Due date</span>

              <input
                onChange={(event) =>
                  updateForm(
                    "due_date",
                    event.target.value ||
                      null,
                  )
                }
                type="datetime-local"
                value={
                  form.due_date ?? ""
                }
              />
            </label>

            <div className="task-form-actions">
              <button
                className="button button-secondary"
                disabled={isSaving}
                onClick={closeForm}
                type="button"
              >
                Cancel
              </button>

              <button
                className="button button-primary"
                disabled={isSaving}
                type="submit"
              >
                {isSaving
                  ? "Saving..."
                  : editingTaskId
                    ? "Save changes"
                    : "Create task"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
