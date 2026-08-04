"use client";

import Link from "next/link";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  Subtask,
  Task,
  TaskProgress,
} from "@/lib/types";


interface SubtaskPanelProps {
  task: Task;
  onTaskChanged: () => Promise<void>;
}


interface SubtaskForm {
  title: string;
  description: string;
}


const emptyForm: SubtaskForm = {
  title: "",
  description: "",
};


const emptyProgress: TaskProgress = {
  task_id: "",
  total_subtasks: 0,
  completed_subtasks: 0,
  progress_percentage: 0,
  is_completed: false,
};


async function readJson(
  response: Response,
): Promise<unknown> {
  const text = await response.text();

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


export function SubtaskPanel({
  task,
  onTaskChanged,
}: SubtaskPanelProps) {
  const [isOpen, setIsOpen] =
    useState(false);

  const [subtasks, setSubtasks] =
    useState<Subtask[]>([]);

  const [progress, setProgress] =
    useState<TaskProgress>({
      ...emptyProgress,
      task_id: task.id,
    });

  const [form, setForm] =
    useState<SubtaskForm>(
      emptyForm,
    );

  const [
    editingSubtaskId,
    setEditingSubtaskId,
  ] = useState<string | null>(
    null,
  );

  const [isLoading, setIsLoading] =
    useState(false);

  const [isSaving, setIsSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");


  const loadSubtasks = useCallback(
    async () => {
      setIsLoading(true);
      setError("");

      try {
        const [
          subtasksResponse,
          progressResponse,
        ] = await Promise.all([
          fetch(
            `/api/subtasks?task_id=${task.id}`,
            {
              cache: "no-store",
            },
          ),
          fetch(
            `/api/subtasks/progress/${task.id}`,
            {
              cache: "no-store",
            },
          ),
        ]);

        const subtasksData =
          await readJson(
            subtasksResponse,
          );

        const progressData =
          await readJson(
            progressResponse,
          );

        if (!subtasksResponse.ok) {
          throw new Error(
            getMessage(
              subtasksData,
              "Subtasks could not be loaded.",
            ),
          );
        }

        if (!progressResponse.ok) {
          throw new Error(
            getMessage(
              progressData,
              "Task progress could not be loaded.",
            ),
          );
        }

        setSubtasks(
          subtasksData as Subtask[],
        );

        setProgress(
          progressData as TaskProgress,
        );
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Subtasks could not be loaded.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [task.id],
  );


  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const timeoutId =
      window.setTimeout(() => {
        void loadSubtasks();
      }, 0);

    return () => {
      window.clearTimeout(
        timeoutId,
      );
    };
  }, [
    isOpen,
    loadSubtasks,
  ]);


  const progressLabel = useMemo(
    () => {
      if (
        progress.total_subtasks === 0
      ) {
        return "No subtasks yet";
      }

      return (
        `${progress.completed_subtasks} of ` +
        `${progress.total_subtasks} completed`
      );
    },
    [progress],
  );


  function resetForm() {
    setForm(emptyForm);
    setEditingSubtaskId(null);
  }


  function beginEdit(
    subtask: Subtask,
  ) {
    setEditingSubtaskId(
      subtask.id,
    );

    setForm({
      title: subtask.title,
      description:
        subtask.description ?? "",
    });

    setMessage("");
    setError("");
  }


  async function refreshEverything() {
    await Promise.all([
      loadSubtasks(),
      onTaskChanged(),
    ]);
  }


  async function submitSubtask(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const title =
      form.title.trim();

    if (!title) {
      setError(
        "Enter a title for the subtask."
      );

      return;
    }

    setIsSaving(true);
    setError("");
    setMessage("");

    const endpoint =
      editingSubtaskId
        ? `/api/subtasks/${editingSubtaskId}`
        : "/api/subtasks";

    const method =
      editingSubtaskId
        ? "PUT"
        : "POST";

    const payload =
      editingSubtaskId
        ? {
            title,
            description:
              form.description.trim()
              || null,
          }
        : {
            task_id: task.id,
            title,
            description:
              form.description.trim()
              || null,
          };

    try {
      const response = await fetch(
        endpoint,
        {
          method,
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(
            payload,
          ),
        },
      );

      const data =
        await readJson(response);

      if (!response.ok) {
        throw new Error(
          getMessage(
            data,
            "The subtask could not be saved.",
          ),
        );
      }

      setMessage(
        editingSubtaskId
          ? "Subtask updated."
          : "Subtask added.",
      );

      resetForm();

      await refreshEverything();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "The subtask could not be saved.",
      );
    } finally {
      setIsSaving(false);
    }
  }


  async function toggleSubtask(
    subtask: Subtask,
  ) {
    setError("");
    setMessage("");

    const completed =
      !subtask.is_completed;

    try {
      const response = await fetch(
        `/api/subtasks/${subtask.id}/complete?completed=${completed}`,
        {
          method: "PATCH",
        },
      );

      const data =
        await readJson(response);

      if (!response.ok) {
        throw new Error(
          getMessage(
            data,
            "The subtask could not be updated.",
          ),
        );
      }

      setMessage(
        completed
          ? "Subtask completed."
          : "Subtask reopened.",
      );

      await refreshEverything();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "The subtask could not be updated.",
      );
    }
  }


  async function removeSubtask(
    subtask: Subtask,
  ) {
    const confirmed =
      window.confirm(
        `Delete "${subtask.title}"?`,
      );

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `/api/subtasks/${subtask.id}`,
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
            "The subtask could not be deleted.",
          ),
        );
      }

      if (
        editingSubtaskId ===
        subtask.id
      ) {
        resetForm();
      }

      setMessage(
        "Subtask deleted."
      );

      await refreshEverything();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "The subtask could not be deleted.",
      );
    }
  }


  async function moveSubtask(
    subtaskIndex: number,
    direction: "up" | "down",
  ) {
    const destinationIndex =
      direction === "up"
        ? subtaskIndex - 1
        : subtaskIndex + 1;

    if (
      destinationIndex < 0 ||
      destinationIndex >=
        subtasks.length
    ) {
      return;
    }

    const reordered = [
      ...subtasks,
    ];

    const [movedSubtask] =
      reordered.splice(
        subtaskIndex,
        1,
      );

    reordered.splice(
      destinationIndex,
      0,
      movedSubtask,
    );

    const previousSubtasks =
      subtasks;

    setSubtasks(
      reordered.map(
        (subtask, index) => ({
          ...subtask,
          position: index,
        }),
      ),
    );

    try {
      const response = await fetch(
        `/api/subtasks/reorder/${task.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            items: reordered.map(
              (subtask, index) => ({
                id: subtask.id,
                position: index,
              }),
            ),
          }),
        },
      );

      const data =
        await readJson(response);

      if (!response.ok) {
        setSubtasks(
          previousSubtasks,
        );

        throw new Error(
          getMessage(
            data,
            "Subtasks could not be reordered.",
          ),
        );
      }

      setSubtasks(
        data as Subtask[],
      );

      setMessage(
        "Subtask order updated."
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Subtasks could not be reordered.",
      );
    }
  }


  return (
    <section className="task-breakdown">
      <div className="task-breakdown-heading">
        <div>
          <strong>
            Task breakdown
          </strong>

          <span>
            {progressLabel}
          </span>
        </div>

        <button
          aria-expanded={isOpen}
          className="task-breakdown-toggle"
          onClick={() =>
            setIsOpen(
              (current) => !current,
            )
          }
          type="button"
        >
          {isOpen
            ? "Hide steps"
            : "Break into steps"}
        </button>
      </div>

      <div
        aria-label={`${progress.progress_percentage}% complete`}
        className="subtask-progress-track"
      >
        <div
          className="subtask-progress-value"
          style={{
            width:
              `${progress.progress_percentage}%`,
          }}
        />
      </div>

      <div className="subtask-progress-label">
        <span>
          {progress.progress_percentage}%
        </span>

        {progress.is_completed ? (
          <strong>
            All steps complete
          </strong>
        ) : null}
      </div>

      {isOpen ? (
        <div className="task-breakdown-body">
          {message ? (
            <p
              className="subtask-message subtask-success"
              role="status"
            >
              {message}
            </p>
          ) : null}

          {error ? (
            <p
              className="subtask-message subtask-error"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <form
            className="subtask-form"
            onSubmit={submitSubtask}
          >
            <div className="subtask-form-heading">
              <strong>
                {editingSubtaskId
                  ? "Edit step"
                  : "Add a small step"}
              </strong>

              {editingSubtaskId ? (
                <button
                  onClick={resetForm}
                  type="button"
                >
                  Cancel edit
                </button>
              ) : null}
            </div>

            <input
              maxLength={200}
              onChange={(event) =>
                setForm(
                  (current) => ({
                    ...current,
                    title:
                      event.target.value,
                  }),
                )
              }
              placeholder="Example: Write the introduction"
              required
              type="text"
              value={form.title}
            />

            <textarea
              maxLength={5000}
              onChange={(event) =>
                setForm(
                  (current) => ({
                    ...current,
                    description:
                      event.target.value,
                  }),
                )
              }
              placeholder="Optional notes for this step"
              rows={3}
              value={
                form.description
              }
            />

            <button
              className="button button-primary"
              disabled={isSaving}
              type="submit"
            >
              {isSaving
                ? "Saving..."
                : editingSubtaskId
                  ? "Save step"
                  : "Add step"}
            </button>
          </form>

          {isLoading ? (
            <p className="subtask-loading">
              Loading steps...
            </p>
          ) : null}

          {!isLoading &&
          subtasks.length === 0 ? (
            <div className="subtask-empty">
              <strong>
                No steps yet
              </strong>

              <p>
                Add the smallest action
                you could begin with.
              </p>
            </div>
          ) : null}

          {subtasks.length > 0 ? (
            <ol className="subtask-list">
              {subtasks.map(
                (
                  subtask,
                  index,
                ) => (
                  <li
                    className={
                      subtask.is_completed
                        ? "subtask-item subtask-item-completed"
                        : "subtask-item"
                    }
                    key={subtask.id}
                  >
                    <button
                      aria-label={
                        subtask.is_completed
                          ? `Reopen ${subtask.title}`
                          : `Complete ${subtask.title}`
                      }
                      className="subtask-complete"
                      onClick={() =>
                        void toggleSubtask(
                          subtask,
                        )
                      }
                      type="button"
                    >
                      {subtask.is_completed
                        ? "✓"
                        : ""}
                    </button>

                    <div className="subtask-content">
                      <strong>
                        {subtask.title}
                      </strong>

                      {subtask.description ? (
                        <p>
                          {
                            subtask.description
                          }
                        </p>
                      ) : null}
                    </div>

                    <div className="subtask-actions">
                      <button
                        aria-label={`Move ${subtask.title} up`}
                        disabled={
                          index === 0
                        }
                        onClick={() =>
                          void moveSubtask(
                            index,
                            "up",
                          )
                        }
                        type="button"
                      >
                        ↑
                      </button>

                      <button
                        aria-label={`Move ${subtask.title} down`}
                        disabled={
                          index ===
                          subtasks.length - 1
                        }
                        onClick={() =>
                          void moveSubtask(
                            index,
                            "down",
                          )
                        }
                        type="button"
                      >
                        ↓
                      </button>

                      <button
                        onClick={() =>
                          beginEdit(
                            subtask,
                          )
                        }
                        type="button"
                      >
                        Edit
                      </button>

                      <button
                        className="subtask-delete"
                        onClick={() =>
                          void removeSubtask(
                            subtask,
                          )
                        }
                        type="button"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ),
              )}
            </ol>
          ) : null}

          <Link
            className="button button-secondary subtask-focus-link"
            href={
              `/focus?taskId=${task.id}` +
              `&intention=${encodeURIComponent(
                task.title,
              )}`
            }
          >
            Start focus for this task
          </Link>
        </div>
      ) : null}
    </section>
  );
}
