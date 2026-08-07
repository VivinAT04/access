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
  AksessNotification,
  NotificationDigestFrequency,
  NotificationPreference,
  NotificationSummary,
} from "@/lib/types";


type ToggleKey =
  | "in_app_enabled"
  | "browser_enabled"
  | "task_reminders"
  | "routine_reminders"
  | "focus_reminders"
  | "wellbeing_checkins"
  | "community_activity"
  | "product_updates"
  | "quiet_hours_enabled";


const toggleLabels:
  Record<
    ToggleKey,
    {
      title: string;
      description: string;
    }
  > = {
    in_app_enabled: {
      title:
        "In-app notifications",
      description:
        "Show useful updates inside Aksess.",
    },

    browser_enabled: {
      title:
        "Browser notifications",
      description:
        "Allow notification pop-ups when your browser gives permission.",
    },

    task_reminders: {
      title:
        "Task reminders",
      description:
        "Receive gentle reminders about tasks you chose to track.",
    },

    routine_reminders: {
      title:
        "Routine reminders",
      description:
        "Receive prompts connected to your routines.",
    },

    focus_reminders: {
      title:
        "Focus reminders",
      description:
        "Receive optional prompts when you planned to focus.",
    },

    wellbeing_checkins: {
      title:
        "Wellbeing check-ins",
      description:
        "Receive gentle prompts to check in with mood or reflection.",
    },

    community_activity: {
      title:
        "Community activity",
      description:
        "Receive updates about future replies and supportive community activity.",
    },

    product_updates: {
      title:
        "Product updates",
      description:
        "Receive occasional information about new Aksess capabilities.",
    },

    quiet_hours_enabled: {
      title:
        "Quiet hours",
      description:
        "Avoid non-urgent notifications during your chosen rest period.",
    },
  };


function formatDate(
  value: string,
): string {
  return new Intl.DateTimeFormat(
    undefined,
    {
      dateStyle:
        "medium",
      timeStyle:
        "short",
    },
  ).format(
    new Date(
      value,
    ),
  );
}


export function NotificationCentre() {
  const [
    notifications,
    setNotifications,
  ] =
    useState<
      AksessNotification[]
    >([]);

  const [
    preferences,
    setPreferences,
  ] =
    useState<
      NotificationPreference
      | null
    >(null);

  const [
    summary,
    setSummary,
  ] =
    useState<
      NotificationSummary
    >({
      total: 0,
      unread: 0,
      dismissed: 0,
    });

  const [
    unreadOnly,
    setUnreadOnly,
  ] =
    useState(false);

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
    browserPermission,
    setBrowserPermission,
  ] =
    useState<
      NotificationPermission
      | "unsupported"
    >(
      "unsupported",
    );

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
          const query =
            unreadOnly
              ? "?unread_only=true"
              : "";

          const [
            notificationsResponse,
            preferencesResponse,
            summaryResponse,
          ] =
            await Promise.all([
              fetch(
                (
                  "/api/notifications"
                  + query
                ),
                {
                  cache:
                    "no-store",
                },
              ),

              fetch(
                "/api/notifications/preferences",
                {
                  cache:
                    "no-store",
                },
              ),

              fetch(
                "/api/notifications/summary",
                {
                  cache:
                    "no-store",
                },
              ),
            ]);

          if (
            !notificationsResponse.ok
            || !preferencesResponse.ok
            || !summaryResponse.ok
          ) {
            throw new Error(
              "Notifications could not be loaded.",
            );
          }

          const notificationData:
            AksessNotification[] =
              await notificationsResponse.json();

          const preferenceData:
            NotificationPreference =
              await preferencesResponse.json();

          const summaryData:
            NotificationSummary =
              await summaryResponse.json();

          setNotifications(
            notificationData,
          );

          setPreferences(
            preferenceData,
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
              : "Notifications could not be loaded.",
          );
        } finally {
          setIsLoading(
            false,
          );
        }
      },
      [
        unreadOnly,
      ],
    );


  useEffect(() => {
    const id =
      window.setTimeout(
        () => {
          if (
            "Notification"
            in window
          ) {
            setBrowserPermission(
              window.Notification
                .permission,
            );
          }

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
    changes:
      Partial<
        NotificationPreference
      >,
  ) {
    if (!preferences) {
      return;
    }

    const previous =
      preferences;

    setPreferences({
      ...preferences,
      ...changes,
    });

    setIsSaving(
      true,
    );

    setError("");
    setMessage("");

    try {
      const response =
        await fetch(
          "/api/notifications/preferences",
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
        throw new Error(
          "Notification preferences could not be saved.",
        );
      }

      const updated:
        NotificationPreference =
          await response.json();

      setPreferences(
        updated,
      );

      setMessage(
        "Notification preferences saved.",
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
          : "Notification preferences could not be saved.",
      );
    } finally {
      setIsSaving(
        false,
      );
    }
  }


  async function requestBrowserPermission() {
    if (
      !(
        "Notification"
        in window
      )
    ) {
      setBrowserPermission(
        "unsupported",
      );

      setError(
        "This browser does not support browser notifications.",
      );

      return;
    }

    const permission =
      await window.Notification
        .requestPermission();

    setBrowserPermission(
      permission,
    );

    if (
      permission
      === "granted"
    ) {
      await updatePreference({
        browser_enabled:
          true,
      });

      new window.Notification(
        "Aksess notifications enabled",
        {
          body:
            "You remain in control. Quiet hours and notification types can be changed at any time.",
        },
      );

      return;
    }

    await updatePreference({
      browser_enabled:
        false,
    });
  }


  async function sendBrowserPreview() {
    if (
      browserPermission
      !== "granted"
    ) {
      await requestBrowserPermission();
      return;
    }

    new window.Notification(
      "Aksess",
      {
        body:
          "A gentle reminder from Aksess.",
      },
    );
  }


  async function markRead(
    notificationId: string,
  ) {
    const response =
      await fetch(
        (
          `/api/notifications/`
          + `${notificationId}/read`
        ),
        {
          method:
            "PATCH",
        },
      );

    if (!response.ok) {
      setError(
        "Notification could not be marked as read.",
      );

      return;
    }

    await loadData();
  }


  async function markAllRead() {
    const response =
      await fetch(
        "/api/notifications/read-all",
        {
          method:
            "PATCH",
        },
      );

    if (!response.ok) {
      setError(
        "Notifications could not be marked as read.",
      );

      return;
    }

    setMessage(
      "All notifications marked as read.",
    );

    await loadData();
  }


  async function dismiss(
    notificationId: string,
  ) {
    const response =
      await fetch(
        (
          `/api/notifications/`
          + `${notificationId}/dismiss`
        ),
        {
          method:
            "PATCH",
        },
      );

    if (!response.ok) {
      setError(
        "Notification could not be dismissed.",
      );

      return;
    }

    await loadData();
  }


  async function createPreview() {
    const response =
      await fetch(
        "/api/notifications/preview",
        {
          method:
            "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify({
              notification_type:
                "wellbeing",

              title:
                "A gentle check-in",

              message:
                "Take a moment to notice your energy and choose the next small step.",

              action_url:
                "/mood",

              priority:
                "normal",
            }),
        },
      );

    if (!response.ok) {
      setError(
        "Preview notification could not be created.",
      );

      return;
    }

    setMessage(
      "Preview notification added.",
    );

    await loadData();
  }


  const toggleKeys:
    ToggleKey[] = [
      "in_app_enabled",
      "browser_enabled",
      "task_reminders",
      "routine_reminders",
      "focus_reminders",
      "wellbeing_checkins",
      "community_activity",
      "product_updates",
      "quiet_hours_enabled",
    ];


  return (
    <main className="notification-page">
      <header className="phase3-header">
        <Logo />

        <Link
          className="button button-secondary"
          href="/dashboard"
        >
          Back to dashboard
        </Link>
      </header>


      <section className="notification-hero">
        <p className="eyebrow">
          Advanced notifications
        </p>

        <h1>
          Reminders without pressure
        </h1>

        <p>
          Choose what is useful, silence what is
          not, and set quiet hours so Aksess works
          around your attention rather than
          demanding it.
        </p>
      </section>


      <section className="notification-summary-grid">
        <article>
          <span>
            Inbox
          </span>

          <strong>
            {
              summary.total
            }
          </strong>
        </article>

        <article>
          <span>
            Unread
          </span>

          <strong>
            {
              summary.unread
            }
          </strong>
        </article>

        <article>
          <span>
            Dismissed
          </span>

          <strong>
            {
              summary.dismissed
            }
          </strong>
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


      <section className="notification-settings-card">
        <p className="eyebrow">
          Preferences
        </p>

        <h2>
          What should Aksess notify you about?
        </h2>

        {preferences ? (
          <>
            <div className="notification-toggle-list">
              {toggleKeys.map(
                (
                  key,
                ) => (
                  <label
                    className="notification-toggle"
                    key={
                      key
                    }
                  >
                    <span>
                      <strong>
                        {
                          toggleLabels[
                            key
                          ].title
                        }
                      </strong>

                      <small>
                        {
                          toggleLabels[
                            key
                          ].description
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
                        void updatePreference({
                          [key]:
                            event
                              .target
                              .checked,
                        })
                      }
                      type="checkbox"
                    />
                  </label>
                ),
              )}
            </div>


            <div className="notification-settings-grid">
              <label>
                <span>
                  Digest frequency
                </span>

                <select
                  disabled={
                    isSaving
                  }
                  onChange={(
                    event,
                  ) => {
                    const frequency =
                      event.target.value as NotificationDigestFrequency;

                    void updatePreference({
                      digest_frequency:
                        frequency,
                    });
                  }}
                  value={
                    preferences
                      .digest_frequency
                  }
                >
                  <option value="instant">
                    Instant
                  </option>

                  <option value="hourly">
                    Hourly digest
                  </option>

                  <option value="daily">
                    Daily digest
                  </option>

                  <option value="off">
                    Off
                  </option>
                </select>
              </label>


              <label>
                <span>
                  Maximum per day
                </span>

                <input
                  max={50}
                  min={1}
                  onChange={(
                    event,
                  ) =>
                    void updatePreference({
                      max_daily_notifications:
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
                      .max_daily_notifications
                  }
                />
              </label>


              <label>
                <span>
                  Quiet hours start
                </span>

                <input
                  disabled={
                    !preferences
                      .quiet_hours_enabled
                  }
                  onChange={(
                    event,
                  ) =>
                    void updatePreference({
                      quiet_hours_start:
                        event
                          .target
                          .value,
                    })
                  }
                  type="time"
                  value={
                    preferences
                      .quiet_hours_start
                  }
                />
              </label>


              <label>
                <span>
                  Quiet hours end
                </span>

                <input
                  disabled={
                    !preferences
                      .quiet_hours_enabled
                  }
                  onChange={(
                    event,
                  ) =>
                    void updatePreference({
                      quiet_hours_end:
                        event
                          .target
                          .value,
                    })
                  }
                  type="time"
                  value={
                    preferences
                      .quiet_hours_end
                  }
                />
              </label>
            </div>
          </>
        ) : null}


        <div className="notification-browser-panel">
          <div>
            <strong>
              Browser permission
            </strong>

            <p>
              Current status: {
                browserPermission
              }
            </p>
          </div>

          <div>
            <button
              className="button button-secondary"
              onClick={() =>
                void requestBrowserPermission()
              }
              type="button"
            >
              Request permission
            </button>

            <button
              className="button button-secondary"
              onClick={() =>
                void sendBrowserPreview()
              }
              type="button"
            >
              Test browser notification
            </button>
          </div>
        </div>
      </section>


      <section className="notification-inbox-card">
        <div className="notification-inbox-heading">
          <div>
            <p className="eyebrow">
              Inbox
            </p>

            <h2>
              Your notifications
            </h2>
          </div>

          <div className="notification-inbox-tools">
            <label>
              <input
                checked={
                  unreadOnly
                }
                onChange={(
                  event,
                ) =>
                  setUnreadOnly(
                    event
                      .target
                      .checked,
                  )
                }
                type="checkbox"
              />

              Unread only
            </label>

            <button
              className="button button-secondary"
              onClick={() =>
                void markAllRead()
              }
              type="button"
            >
              Mark all read
            </button>

            <button
              className="button button-secondary"
              onClick={() =>
                void createPreview()
              }
              type="button"
            >
              Add preview
            </button>
          </div>
        </div>


        {isLoading ? (
          <p role="status">
            Loading notifications...
          </p>
        ) : null}


        {
          !isLoading
          && notifications.length
          === 0
            ? (
              <div className="notification-empty">
                <h3>
                  You are all caught up
                </h3>

                <p>
                  Nothing needs your attention
                  right now.
                </p>
              </div>
            )
            : null
        }


        <div className="notification-list">
          {notifications.map(
            (
              notification,
            ) => (
              <article
                className={
                  notification
                    .is_read
                    ? "notification-item"
                    : (
                        "notification-item "
                        + "notification-item-unread"
                      )
                }
                key={
                  notification.id
                }
              >
                <div className="notification-item-main">
                  <div className="notification-item-meta">
                    <span className="status-pill">
                      {
                        notification
                          .notification_type
                      }
                    </span>

                    {
                      !notification
                        .is_read
                        ? (
                          <span className="notification-unread-dot">
                            Unread
                          </span>
                        )
                        : null
                    }
                  </div>

                  <h3>
                    {
                      notification.title
                    }
                  </h3>

                  <p>
                    {
                      notification.message
                    }
                  </p>

                  <small>
                    {
                      formatDate(
                        notification
                          .created_at,
                      )
                    }
                  </small>
                </div>

                <div className="notification-item-actions">
                  {
                    notification
                      .action_url
                      ? (
                        <Link
                          className="button button-secondary"
                          href={
                            notification
                              .action_url
                          }
                          onClick={() =>
                            void markRead(
                              notification.id,
                            )
                          }
                        >
                          Open
                        </Link>
                      )
                      : null
                  }

                  {
                    !notification
                      .is_read
                      ? (
                        <button
                          onClick={() =>
                            void markRead(
                              notification.id,
                            )
                          }
                          type="button"
                        >
                          Mark read
                        </button>
                      )
                      : null
                  }

                  <button
                    onClick={() =>
                      void dismiss(
                        notification.id,
                      )
                    }
                    type="button"
                  >
                    Dismiss
                  </button>
                </div>
              </article>
            ),
          )}
        </div>
      </section>
    </main>
  );
}
