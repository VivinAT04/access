"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  DailyInsightPoint,
  ReflectionInsights,
} from "@/lib/types";


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


function getErrorMessage(
  data: unknown,
): string {
  if (
    typeof data === "object" &&
    data !== null &&
    "detail" in data &&
    typeof data.detail === "string"
  ) {
    return data.detail;
  }

  if (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof data.message === "string"
  ) {
    return data.message;
  }

  return "Insights could not be loaded.";
}


function formatPeriod(
  start: string,
  end: string,
): string {
  const formatter =
    new Intl.DateTimeFormat(
      "en-GB",
      {
        day: "numeric",
        month: "short",
      },
    );

  return (
    `${formatter.format(
      new Date(
        `${start}T12:00:00`,
      ),
    )} – ` +
    `${formatter.format(
      new Date(
        `${end}T12:00:00`,
      ),
    )}`
  );
}


function scoreLabel(
  value: number | null,
): string {
  return value === null
    ? "No data"
    : `${value.toFixed(1)} / 5`;
}


function moodSymbol(
  value: number | null,
): string {
  if (value === null) {
    return "—";
  }

  if (value < 1.5) {
    return "😞";
  }

  if (value < 2.5) {
    return "🙁";
  }

  if (value < 3.5) {
    return "😐";
  }

  if (value < 4.5) {
    return "🙂";
  }

  return "😊";
}


export function InsightsDashboard() {
  const [
    insights,
    setInsights,
  ] = useState<
    ReflectionInsights | null
  >(null);

  const [error, setError] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(true);


  const loadInsights =
    useCallback(
      async () => {
        setIsLoading(true);
        setError("");

        try {
          const response =
            await fetch(
              "/api/insights/weekly",
              {
                cache:
                  "no-store",
              },
            );

          const data =
            await readJson(
              response,
            );

          if (!response.ok) {
            throw new Error(
              getErrorMessage(
                data,
              ),
            );
          }

          setInsights(
            data as ReflectionInsights,
          );
        } catch (caughtError) {
          setError(
            caughtError
              instanceof Error
              ? caughtError.message
              : "Insights could not be loaded.",
          );
        } finally {
          setIsLoading(false);
        }
      },
      [],
    );


  useEffect(() => {
    const timeoutId =
      window.setTimeout(
        () => {
          void loadInsights();
        },
        0,
      );

    return () =>
      window.clearTimeout(
        timeoutId,
      );
  }, [loadInsights]);


  const maximumFocusMinutes =
    useMemo(() => {
      if (!insights) {
        return 1;
      }

      return Math.max(
        1,
        ...insights.days.map(
          (day) =>
            day.focus_minutes,
        ),
      );
    }, [insights]);


  if (isLoading) {
    return (
      <section className="insights-loading-card">
        Preparing your weekly insights...
      </section>
    );
  }


  if (error || !insights) {
    return (
      <section className="insights-error-card">
        <strong>
          Insights could not be loaded
        </strong>

        <p>
          {error}
        </p>

        <button
          className="button button-primary"
          onClick={() =>
            void loadInsights()
          }
          type="button"
        >
          Try again
        </button>
      </section>
    );
  }


  const {
    summary,
    days,
    suggestions,
  } = insights;


  return (
    <>
      <section className="insights-period-card">
        <div>
          <p className="eyebrow">
            Your recent seven days
          </p>

          <h2>
            {formatPeriod(
              summary.period_start,
              summary.period_end,
            )}
          </h2>
        </div>

        <p>
          These insights describe only
          the information you recorded.
          They are gentle observations,
          not medical conclusions.
        </p>
      </section>

      <section className="insights-stat-grid">
        <StatCard
          label="Focus time"
          value={
            `${summary.total_focus_minutes} min`
          }
        />

        <StatCard
          label="Focus sessions"
          value={String(
            summary.total_focus_sessions,
          )}
        />

        <StatCard
          label="Mood check-ins"
          value={String(
            summary.total_mood_checkins,
          )}
        />

        <StatCard
          label="Reflections"
          value={String(
            summary.total_reflections,
          )}
        />
      </section>

      <section className="insights-score-grid">
        <ScoreCard
          label="Average mood"
          symbol={moodSymbol(
            summary.average_mood,
          )}
          value={scoreLabel(
            summary.average_mood,
          )}
        />

        <ScoreCard
          label="Average energy"
          symbol="⚡"
          value={scoreLabel(
            summary.average_energy,
          )}
        />

        <ScoreCard
          label="Average stress"
          symbol="◌"
          value={scoreLabel(
            summary.average_stress,
          )}
        />
      </section>

      <section className="insights-chart-grid">
        <MetricChart
          days={days}
          description="Daily average from your mood check-ins."
          getValue={(day) =>
            day.mood_average
          }
          label="Mood"
          maximum={5}
        />

        <MetricChart
          days={days}
          description="Daily average from your energy rating."
          getValue={(day) =>
            day.energy_average
          }
          label="Energy"
          maximum={5}
        />

        <MetricChart
          days={days}
          description="Daily average from your stress rating."
          getValue={(day) =>
            day.stress_average
          }
          label="Stress"
          maximum={5}
        />

        <FocusChart
          days={days}
          maximum={
            maximumFocusMinutes
          }
        />
      </section>

      <section className="insights-suggestions-card">
        <p className="eyebrow">
          Gentle observations
        </p>

        <h2>
          Patterns worth noticing
        </h2>

        <p className="insights-suggestions-intro">
          You do not need to act on every
          suggestion. Keep only what feels
          useful.
        </p>

        <div className="insights-suggestion-list">
          {suggestions.map(
            (
              suggestion,
              index,
            ) => (
              <article
                key={
                  `${index}-${suggestion}`
                }
              >
                <span>
                  {String(
                    index + 1,
                  ).padStart(
                    2,
                    "0",
                  )}
                </span>

                <p>
                  {suggestion}
                </p>
              </article>
            ),
          )}
        </div>
      </section>

      <section className="insights-week-table">
        <div>
          <p className="eyebrow">
            Weekly detail
          </p>

          <h2>
            Day-by-day summary
          </h2>
        </div>

        <div className="insights-day-list">
          {days.map(
            (day) => (
              <article key={day.date}>
                <div>
                  <strong>
                    {day.day_label}
                  </strong>

                  <small>
                    {new Intl.DateTimeFormat(
                      "en-GB",
                      {
                        day:
                          "numeric",
                        month:
                          "short",
                      },
                    ).format(
                      new Date(
                        `${day.date}T12:00:00`,
                      ),
                    )}
                  </small>
                </div>

                <span>
                  {moodSymbol(
                    day.mood_average,
                  )}{" "}
                  {day.mood_average
                    ?? "—"}
                </span>

                <span>
                  ⚡{" "}
                  {day.energy_average
                    ?? "—"}
                </span>

                <span>
                  Stress{" "}
                  {day.stress_average
                    ?? "—"}
                </span>

                <span>
                  {
                    day.focus_minutes
                  }{" "}
                  min
                </span>

                <span>
                  {
                    day.reflections
                  }{" "}
                  reflection
                  {day.reflections
                  === 1
                    ? ""
                    : "s"}
                </span>
              </article>
            ),
          )}
        </div>
      </section>
    </>
  );
}


function StatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <article>
      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>
    </article>
  );
}


function ScoreCard({
  label,
  symbol,
  value,
}: {
  label: string;
  symbol: string;
  value: string;
}) {
  return (
    <article>
      <span
        aria-hidden="true"
        className="insights-score-symbol"
      >
        {symbol}
      </span>

      <div>
        <span>
          {label}
        </span>

        <strong>
          {value}
        </strong>
      </div>
    </article>
  );
}


function MetricChart({
  days,
  label,
  description,
  maximum,
  getValue,
}: {
  days: DailyInsightPoint[];
  label: string;
  description: string;
  maximum: number;
  getValue: (
    day: DailyInsightPoint,
  ) => number | null;
}) {
  const hasData =
    days.some(
      (day) =>
        getValue(day) !== null,
    );

  return (
    <section className="insights-chart-card">
      <div>
        <p className="eyebrow">
          Seven-day trend
        </p>

        <h2>
          {label}
        </h2>

        <p>
          {description}
        </p>
      </div>

      {!hasData ? (
        <div className="insights-empty-chart">
          No recorded data yet
        </div>
      ) : (
        <div className="insights-bars">
          {days.map(
            (day) => {
              const value =
                getValue(day);

              const percentage =
                value === null
                  ? 0
                  : Math.max(
                      5,
                      (
                        value
                        / maximum
                      ) * 100,
                    );

              return (
                <div
                  className="insights-bar-column"
                  key={day.date}
                >
                  <span>
                    {value ?? "—"}
                  </span>

                  <div className="insights-bar-track">
                    <div
                      className={
                        value === null
                          ? "insights-bar insights-bar-empty"
                          : "insights-bar"
                      }
                      style={{
                        height:
                          `${percentage}%`,
                      }}
                    />
                  </div>

                  <small>
                    {day.day_label}
                  </small>
                </div>
              );
            },
          )}
        </div>
      )}
    </section>
  );
}


function FocusChart({
  days,
  maximum,
}: {
  days: DailyInsightPoint[];
  maximum: number;
}) {
  const hasData =
    days.some(
      (day) =>
        day.focus_minutes > 0,
    );

  return (
    <section className="insights-chart-card">
      <div>
        <p className="eyebrow">
          Seven-day trend
        </p>

        <h2>
          Focus time
        </h2>

        <p>
          Completed focused minutes for
          each day.
        </p>
      </div>

      {!hasData ? (
        <div className="insights-empty-chart">
          No completed focus sessions yet
        </div>
      ) : (
        <div className="insights-bars">
          {days.map(
            (day) => {
              const percentage =
                day.focus_minutes
                === 0
                  ? 0
                  : Math.max(
                      5,
                      (
                        day.focus_minutes
                        / maximum
                      ) * 100,
                    );

              return (
                <div
                  className="insights-bar-column"
                  key={day.date}
                >
                  <span>
                    {
                      day.focus_minutes
                    }
                  </span>

                  <div className="insights-bar-track">
                    <div
                      className={
                        day.focus_minutes
                        === 0
                          ? "insights-bar insights-bar-empty"
                          : "insights-bar insights-focus-bar"
                      }
                      style={{
                        height:
                          `${percentage}%`,
                      }}
                    />
                  </div>

                  <small>
                    {day.day_label}
                  </small>
                </div>
              );
            },
          )}
        </div>
      )}
    </section>
  );
}
