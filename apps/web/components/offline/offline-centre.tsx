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

import {
  clearQueue,
  createOfflineQueueItem,
  readQueue,
  saveQueueItem,
} from "@/lib/offline/database";

import {
  syncOfflineQueue,
} from "@/lib/offline/sync";

import type {
  OfflineQueueItem,
  OfflineSyncStatus,
} from "@/lib/types";


function formatDate(
  value:
    string,
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


export function OfflineCentre() {
  const [
    online,
    setOnline,
  ] =
    useState(
      true,
    );

  const [
    queue,
    setQueue,
  ] =
    useState<
      OfflineQueueItem[]
    >([]);

  const [
    status,
    setStatus,
  ] =
    useState<
      OfflineSyncStatus
      | null
    >(null);

  const [
    message,
    setMessage,
  ] =
    useState(
      "",
    );

  const [
    error,
    setError,
  ] =
    useState(
      "",
    );

  const [
    syncing,
    setSyncing,
  ] =
    useState(
      false,
    );


  const loadQueue =
    useCallback(
      async () => {
        const items =
          await readQueue();

        setQueue(
          items,
        );
      },
      [],
    );


  const loadStatus =
    useCallback(
      async () => {
        if (
          !navigator.onLine
        ) {
          return;
        }

        const response =
          await fetch(
            "/api/offline-sync/status",
            {
              cache:
                "no-store",
            },
          );

        if (!response.ok) {
          return;
        }

        const data:
          OfflineSyncStatus =
            await response.json();

        setStatus(
          data,
        );
      },
      [],
    );


  useEffect(() => {
    const id =
      window.setTimeout(
        () => {
          setOnline(
            navigator.onLine,
          );

          void loadQueue();

          void loadStatus();
        },
        0,
      );

    const handleOnline =
      () => {
        setOnline(
          true,
        );

        void loadStatus();
      };

    const handleOffline =
      () => {
        setOnline(
          false,
        );
      };

    window.addEventListener(
      "online",
      handleOnline,
    );

    window.addEventListener(
      "offline",
      handleOffline,
    );

    return () => {
      window.clearTimeout(
        id,
      );

      window.removeEventListener(
        "online",
        handleOnline,
      );

      window.removeEventListener(
        "offline",
        handleOffline,
      );
    };
  }, [
    loadQueue,
    loadStatus,
  ]);


  async function addTestQueueItem() {
    const item =
      createOfflineQueueItem(
        "task",
        "create",
        {
          title:
            "Offline test task",

          note:
            "Created from the offline sync prototype.",
        },
      );

    await saveQueueItem(
      item,
    );

    setMessage(
      "A local offline change was queued.",
    );

    await loadQueue();
  }


  async function syncNow() {
    if (
      !navigator.onLine
    ) {
      setError(
        "You are currently offline.",
      );

      return;
    }

    setSyncing(
      true,
    );

    setMessage(
      "",
    );

    setError(
      "",
    );

    try {
      const result =
        await syncOfflineQueue();

      setMessage(
        (
          `${result.synced} queued change`
          + (
              result.synced
              === 1
                ? ""
                : "s"
            )
          + " synchronised."
        ),
      );

      await loadQueue();

      await loadStatus();
    } finally {
      setSyncing(
        false,
      );
    }
  }


  async function clearLocalQueue() {
    const confirmed =
      window.confirm(
        "Delete all locally queued offline changes?",
      );

    if (!confirmed) {
      return;
    }

    await clearQueue();

    setMessage(
      "Local offline queue cleared.",
    );

    await loadQueue();
  }


  async function clearServerHistory() {
    const response =
      await fetch(
        "/api/offline-sync/history",
        {
          method:
            "DELETE",
        },
      );

    if (!response.ok) {
      setError(
        "Sync history could not be deleted.",
      );

      return;
    }

    setMessage(
      "Server sync history deleted.",
    );

    await loadStatus();
  }


  return (
    <main className="offline-page">
      <header className="phase3-header">
        <Logo />

        <Link
          className="button button-secondary"
          href="/dashboard"
        >
          Back to dashboard
        </Link>
      </header>


      <section className="offline-hero">
        <p className="eyebrow">
          Offline mode
        </p>

        <h1>
          Keep useful parts of Aksess available
        </h1>

        <p>
          Aksess can cache the application shell,
          store supported changes locally and retry
          synchronisation when your connection
          returns.
        </p>
      </section>


      <section className="offline-status-card">
        <span
          className={
            online
              ? "status-pill"
              : "status-pill offline-status-pill"
          }
        >
          {
            online
              ? "Online"
              : "Offline"
          }
        </span>

        <h2>
          {
            online
              ? "Connection available"
              : "Working offline"
          }
        </h2>

        <p>
          {
            online
              ? (
                  "Queued supported changes can now "
                  + "be synchronised."
                )
              : (
                  "Changes placed in the offline queue "
                  + "remain on this device until a "
                  + "connection is available."
                )
          }
        </p>
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


      <section className="offline-summary-grid">
        <article>
          <span>
            Local queue
          </span>

          <strong>
            {
              queue.length
            }
          </strong>
        </article>

        <article>
          <span>
            Synced history
          </span>

          <strong>
            {
              status
                ?.total_synced
              ?? 0
            }
          </strong>
        </article>

        <article>
          <span>
            Connection
          </span>

          <strong>
            {
              online
                ? "Ready"
                : "Offline"
            }
          </strong>
        </article>
      </section>


      <section className="offline-actions-card">
        <p className="eyebrow">
          Prototype controls
        </p>

        <h2>
          Test offline synchronisation
        </h2>

        <p>
          This creates a safe test queue item so the
          sync pipeline can be verified before we
          connect every task and routine mutation
          to the queue.
        </p>

        <div className="offline-actions">
          <button
            className="button button-secondary"
            onClick={() =>
              void addTestQueueItem()
            }
            type="button"
          >
            Add test offline change
          </button>

          <button
            className="button button-primary"
            disabled={
              !online
              || syncing
              || queue.length
              === 0
            }
            onClick={() =>
              void syncNow()
            }
            type="button"
          >
            {
              syncing
                ? "Syncing..."
                : "Sync now"
            }
          </button>

          <button
            className="button button-secondary"
            onClick={() =>
              void clearLocalQueue()
            }
            type="button"
          >
            Clear local queue
          </button>
        </div>
      </section>


      <section className="offline-queue-card">
        <p className="eyebrow">
          Local queue
        </p>

        <h2>
          Pending changes
        </h2>

        {queue.length === 0 ? (
          <p>
            Nothing is waiting to synchronise.
          </p>
        ) : (
          <div className="offline-record-list">
            {queue.map(
              (
                item,
              ) => (
                <article
                  key={
                    item.id
                  }
                >
                  <div>
                    <strong>
                      {
                        item.resource_type
                      }
                    </strong>

                    <small>
                      {
                        item.operation
                      }
                      {" · "}
                      {
                        item.status
                      }
                    </small>
                  </div>

                  <span>
                    Retry {
                      item.retry_count
                    }
                  </span>
                </article>
              ),
            )}
          </div>
        )}
      </section>


      <section className="offline-history-card">
        <p className="eyebrow">
          Sync history
        </p>

        <h2>
          Recent server acknowledgements
        </h2>

        {!status
          || status
            .recent_records
            .length
          === 0 ? (
          <p>
            No synchronised records yet.
          </p>
        ) : (
          <div className="offline-record-list">
            {status
              .recent_records
              .map(
                (
                  record,
                ) => (
                  <article
                    key={
                      record.id
                    }
                  >
                    <div>
                      <strong>
                        {
                          record
                            .resource_type
                        }
                      </strong>

                      <small>
                        {
                          record.operation
                        }
                        {" · "}
                        {
                          record.status
                        }
                      </small>
                    </div>

                    <span>
                      {
                        formatDate(
                          record
                            .synced_at,
                        )
                      }
                    </span>
                  </article>
                ),
              )}
          </div>
        )}

        <button
          className="button button-secondary"
          disabled={
            !online
          }
          onClick={() =>
            void clearServerHistory()
          }
          type="button"
        >
          Delete sync history
        </button>
      </section>
    </main>
  );
}
