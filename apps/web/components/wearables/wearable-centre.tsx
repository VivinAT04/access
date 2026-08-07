"use client";

import Link from "next/link";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Logo,
} from "@/components/layout/logo";

import type {
  HeartRateSample,
  WearableAnalysis,
  WearableDashboard,
  WearableDevice,
  WearablePrivacyStatus,
} from "@/lib/types";


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


export function WearableCentre() {
  const [
    privacy,
    setPrivacy,
  ] =
    useState<
      WearablePrivacyStatus
      | null
    >(null);

  const [
    dashboard,
    setDashboard,
  ] =
    useState<
      WearableDashboard
      | null
    >(null);

  const [
    analysis,
    setAnalysis,
  ] =
    useState<
      WearableAnalysis
      | null
    >(null);

  const [
    bpm,
    setBpm,
  ] =
    useState(
      70,
    );

  const [
    deviceName,
    setDeviceName,
  ] =
    useState(
      "My smartwatch",
    );

  const [
    isLoading,
    setIsLoading,
  ] =
    useState(
      true,
    );

  const [
    isSaving,
    setIsSaving,
  ] =
    useState(
      false,
    );

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


  const loadData =
    useCallback(
      async () => {
        setIsLoading(
          true,
        );

        setError(
          "",
        );

        try {
          const [
            privacyResponse,
            dashboardResponse,
            analysisResponse,
          ] =
            await Promise.all([
              fetch(
                "/api/wearables/privacy",
                {
                  cache:
                    "no-store",
                },
              ),

              fetch(
                "/api/wearables/dashboard",
                {
                  cache:
                    "no-store",
                },
              ),

              fetch(
                "/api/wearables/analysis",
                {
                  cache:
                    "no-store",
                },
              ),
            ]);

          if (
            !privacyResponse.ok
            || !dashboardResponse.ok
            || !analysisResponse.ok
          ) {
            throw new Error(
              "Wearable data could not be loaded.",
            );
          }

          const privacyData:
            WearablePrivacyStatus =
              await privacyResponse.json();

          const dashboardData:
            WearableDashboard =
              await dashboardResponse.json();

          const analysisData:
            WearableAnalysis =
              await analysisResponse.json();

          setPrivacy(
            privacyData,
          );

          setDashboard(
            dashboardData,
          );

          setAnalysis(
            analysisData,
          );
        } catch (
          caughtError
        ) {
          setError(
            caughtError
            instanceof Error
              ? caughtError.message
              : (
                  "Wearable data "
                  + "could not be loaded."
                ),
          );
        } finally {
          setIsLoading(
            false,
          );
        }
      },
      [],
    );


  useEffect(() => {
    const id =
      window.setTimeout(
        () => {
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


  const chartSamples =
    useMemo(
      () =>
        (
          dashboard
          ?.recent_samples
          ?? []
        )
          .slice(
            0,
            20,
          )
          .reverse(),
      [
        dashboard,
      ],
    );


  async function connectDevice(
    event:
      FormEvent<
        HTMLFormElement
      >,
  ) {
    event.preventDefault();

    if (
      !deviceName.trim()
    ) {
      return;
    }

    setIsSaving(
      true,
    );

    setError(
      "",
    );

    try {
      const response =
        await fetch(
          "/api/wearables/devices",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                provider:
                  "manual",

                device_name:
                  deviceName.trim(),
              }),
          },
        );

      if (!response.ok) {
        const data:
          {
            detail?:
              string;
          } =
            await response.json();

        throw new Error(
          data.detail
          ?? (
            "Device could "
            + "not be connected."
          ),
        );
      }

      setMessage(
        "Wearable source added.",
      );

      await loadData();
    } catch (
      caughtError
    ) {
      setError(
        caughtError
        instanceof Error
          ? caughtError.message
          : (
              "Device could not "
              + "be connected."
            ),
      );
    } finally {
      setIsSaving(
        false,
      );
    }
  }


  async function addReading(
    event:
      FormEvent<
        HTMLFormElement
      >,
  ) {
    event.preventDefault();

    setIsSaving(
      true,
    );

    setError(
      "",
    );

    setMessage(
      "",
    );

    try {
      const response =
        await fetch(
          "/api/wearables/heart-rate",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                bpm,

                measured_at:
                  new Date()
                    .toISOString(),

                source:
                  "manual",
              }),
          },
        );

      if (!response.ok) {
        const data:
          {
            detail?:
              string;
          } =
            await response.json();

        throw new Error(
          data.detail
          ?? (
            "Heart-rate sample "
            + "could not be saved."
          ),
        );
      }

      setMessage(
        "Heart-rate sample saved.",
      );

      await loadData();
    } catch (
      caughtError
    ) {
      setError(
        caughtError
        instanceof Error
          ? caughtError.message
          : (
              "Heart-rate sample "
              + "could not be saved."
            ),
      );
    } finally {
      setIsSaving(
        false,
      );
    }
  }


  async function deleteData() {
    const confirmed =
      window.confirm(
        (
          "Delete all wearable devices, "
          + "heart-rate readings and "
          + "wearable analysis data?"
        ),
      );

    if (!confirmed) {
      return;
    }

    const response =
      await fetch(
        "/api/wearables/data",
        {
          method:
            "DELETE",
        },
      );

    if (!response.ok) {
      setError(
        "Wearable data could not be deleted.",
      );

      return;
    }

    setMessage(
      "Wearable data deleted.",
    );

    await loadData();
  }


  if (isLoading) {
    return (
      <main className="wearable-page">
        <p role="status">
          Loading wearable data...
        </p>
      </main>
    );
  }


  return (
    <main className="wearable-page">
      <header className="phase3-header">
        <Logo />

        <Link
          className="button button-secondary"
          href="/dashboard"
        >
          Back to dashboard
        </Link>
      </header>


      <section className="wearable-hero">
        <p className="eyebrow">
          Wearable integration
        </p>

        <h1>
          Notice changes in your heart rate
        </h1>

        <p>
          Aksess can compare heart-rate readings
          with your recent personal baseline and
          offer optional calming support when a
          reading is unusually elevated.
        </p>

        <div className="phase3-safety-banner">
          <strong>
            Not a medical or stress diagnosis
          </strong>

          <span>
            Heart rate changes for many reasons.
            Aksess only identifies possible elevated
            arousal relative to your own recent
            readings.
          </span>
        </div>
      </section>


      {privacy ? (
        <section className="wearable-privacy-card">
          <div>
            <p className="eyebrow">
              Privacy
            </p>

            <h2>
              {
                privacy.enabled
                  ? "Wearable processing enabled"
                  : "Wearable processing disabled"
              }
            </h2>

            <p>
              {
                privacy.explanation
              }
            </p>
          </div>

          {!privacy.enabled ? (
            <Link
              className="button button-primary"
              href="/privacy"
            >
              Enable in privacy centre
            </Link>
          ) : null}
        </section>
      ) : null}


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


      {dashboard ? (
        <section className="wearable-summary-grid">
          <article>
            <span>
              Baseline
            </span>

            <strong>
              {
                dashboard
                  .baseline
                  .baseline_bpm
                ?? "—"
              }
            </strong>

            <small>
              bpm
            </small>
          </article>

          <article>
            <span>
              Baseline samples
            </span>

            <strong>
              {
                dashboard
                  .baseline
                  .sample_count
              }
            </strong>
          </article>

          <article>
            <span>
              Recent signals
            </span>

            <strong>
              {
                dashboard
                  .recent_signals
                  .length
              }
            </strong>
          </article>
        </section>
      ) : null}


      {analysis ? (
        <section
          className={
            analysis
              .possible_elevated_arousal
              ? (
                  "wearable-analysis-card "
                  + "wearable-analysis-alert"
                )
              : "wearable-analysis-card"
          }
        >
          <p className="eyebrow">
            Latest comparison
          </p>

          <h2>
            {
              analysis
                .possible_elevated_arousal
                ? "Possible elevated arousal"
                : "No elevated pattern detected"
            }
          </h2>

          <p>
            {
              analysis.explanation
            }
          </p>

          <strong>
            {
              analysis.suggestion
            }
          </strong>

          {analysis
            .possible_elevated_arousal ? (
            <div className="wearable-support-actions">
              <Link
                className="button button-primary"
                href="/calm"
              >
                Open calm tools
              </Link>

              <Link
                className="button button-secondary"
                href="/voice"
              >
                Open voice guidance
              </Link>
            </div>
          ) : null}
        </section>
      ) : null}


      <section className="wearable-input-grid">
        <form
          className="wearable-form-card"
          onSubmit={
            connectDevice
          }
        >
          <p className="eyebrow">
            Device
          </p>

          <h2>
            Add wearable source
          </h2>

          <p>
            During this prototype, you can add a
            wearable source manually. Native Apple
            Health and Health Connect adapters can
            plug into the same API later.
          </p>

          <label>
            <span>
              Device name
            </span>

            <input
              maxLength={120}
              onChange={(
                event,
              ) =>
                setDeviceName(
                  event.target.value,
                )
              }
              value={
                deviceName
              }
            />
          </label>

          <button
            className="button button-primary"
            disabled={
              isSaving
              || !privacy?.enabled
            }
            type="submit"
          >
            Add device
          </button>
        </form>


        <form
          className="wearable-form-card"
          onSubmit={
            addReading
          }
        >
          <p className="eyebrow">
            Heart rate
          </p>

          <h2>
            Add test reading
          </h2>

          <label>
            <span>
              Beats per minute
            </span>

            <input
              max={240}
              min={30}
              onChange={(
                event,
              ) =>
                setBpm(
                  Number(
                    event.target.value,
                  ),
                )
              }
              type="number"
              value={
                bpm
              }
            />
          </label>

          <button
            className="button button-primary"
            disabled={
              isSaving
              || !privacy?.enabled
            }
            type="submit"
          >
            Save reading
          </button>
        </form>
      </section>


      {chartSamples.length > 0 ? (
        <section className="wearable-chart-card">
          <p className="eyebrow">
            Heart-rate history
          </p>

          <h2>
            Recent readings
          </h2>

          <div
            className="wearable-bar-chart"
            role="img"
            aria-label="Recent heart-rate readings"
          >
            {chartSamples.map(
              (
                sample:
                  HeartRateSample,
              ) => (
                <div
                  className="wearable-bar-column"
                  key={
                    sample.id
                  }
                >
                  <span>
                    {
                      sample.bpm
                    }
                  </span>

                  <div
                    className="wearable-bar"
                    style={{
                      height:
                        `${Math.min(
                          100,
                          Math.max(
                            15,
                            (
                              sample.bpm
                              / 150
                            )
                            * 100,
                          ),
                        )}%`,
                    }}
                  />

                  <small>
                    {
                      new Date(
                        sample
                          .measured_at,
                      )
                        .toLocaleTimeString(
                          [],
                          {
                            hour:
                              "2-digit",

                            minute:
                              "2-digit",
                          },
                        )
                    }
                  </small>
                </div>
              ),
            )}
          </div>
        </section>
      ) : null}


      {dashboard
        && dashboard.devices.length
        > 0 ? (
        <section className="wearable-devices-card">
          <p className="eyebrow">
            Connected sources
          </p>

          <h2>
            Wearable devices
          </h2>

          <div className="wearable-device-list">
            {dashboard.devices.map(
              (
                device:
                  WearableDevice,
              ) => (
                <article
                  key={
                    device.id
                  }
                >
                  <div>
                    <strong>
                      {
                        device
                          .device_name
                      }
                    </strong>

                    <small>
                      {
                        device.provider
                      }
                    </small>
                  </div>

                  <span className="status-pill">
                    {
                      device
                        .is_connected
                        ? "Connected"
                        : "Disconnected"
                    }
                  </span>
                </article>
              ),
            )}
          </div>
        </section>
      ) : null}


      {dashboard
        && dashboard.recent_signals.length
        > 0 ? (
        <section className="wearable-signals-card">
          <p className="eyebrow">
            Pattern history
          </p>

          <h2>
            Possible elevated readings
          </h2>

          {dashboard.recent_signals.map(
            (
              signal,
            ) => (
              <article
                className="wearable-signal-item"
                key={
                  signal.id
                }
              >
                <div>
                  <strong>
                    {
                      signal
                        .observed_bpm
                    } bpm
                  </strong>

                  <p>
                    {
                      signal
                        .percentage_above_baseline
                    }% above the baseline used
                    for this comparison.
                  </p>
                </div>

                <small>
                  {
                    formatDate(
                      signal.created_at,
                    )
                  }
                </small>
              </article>
            ),
          )}
        </section>
      ) : null}


      <section className="wearable-data-card">
        <p className="eyebrow">
          Data controls
        </p>

        <h2>
          Delete wearable data
        </h2>

        <p>
          Delete stored devices, heart-rate
          samples, baseline information and
          detected patterns.
        </p>

        <button
          className="button button-secondary"
          onClick={() =>
            void deleteData()
          }
          type="button"
        >
          Delete wearable data
        </button>
      </section>
    </main>
  );
}
