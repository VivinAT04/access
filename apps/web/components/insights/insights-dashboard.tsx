"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { phase2Text } from "@/components/i18n/phase2-translations";
import { useLanguage } from "@/components/language/language-provider";

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
  locale: string,
): string {
  const formatter =
    new Intl.DateTimeFormat(
      locale,
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
  noData: string,
): string {
  return value === null
    ? noData
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
  const { locale } = useLanguage();

  const t = (
    key: string,
    values: Record<string, string | number> = {},
  ) => phase2Text(
    locale,
    key,
    values,
  );

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
        {t("insights.loading")}
      </section>
    );
  }


  if (error || !insights) {
    return (
      <section className="insights-error-card">
        <strong>
          {t("insights.loadFailed")}
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
          {t("common.tryAgain")}
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
            {t("insights.period")}
          </p>

          <h2>
            {formatPeriod(
              summary.period_start,
              summary.period_end,
              locale,
            )}
          </h2>
        </div>

        <p>
          {t("insights.disclaimer")}
        </p>
      </section>

      <section className="insights-stat-grid">
        <StatCard
          label={t("insights.focusTime")}
          value={
            t(
              "insights.minutes",
              {
                value:
                  summary.total_focus_minutes,
              },
            )
          }
        />

        <StatCard
          label={t("insights.focusSessions")}
          value={String(
            summary.total_focus_sessions,
          )}
        />

        <StatCard
          label={t("insights.moodCheckins")}
          value={String(
            summary.total_mood_checkins,
          )}
        />

        <StatCard
          label={t("insights.reflections")}
          value={String(
            summary.total_reflections,
          )}
        />
      </section>

      <section className="insights-score-grid">
        <ScoreCard
          label={t("insights.averageMood")}
          symbol={moodSymbol(
            summary.average_mood,
          )}
          value={scoreLabel(
            summary.average_mood,
            t("insights.noData"),
          )}
        />

        <ScoreCard
          label={t("insights.averageEnergy")}
          symbol="⚡"
          value={scoreLabel(
            summary.average_energy,
            t("insights.noData"),
          )}
        />

        <ScoreCard
          label={t("insights.averageStress")}
          symbol="◌"
          value={scoreLabel(
            summary.average_stress,
            t("insights.noData"),
          )}
        />
      </section>

      <section className="insights-chart-grid">
        <MetricChart
          days={days}
          description={t("insights.moodDescription")}
          getValue={(day) =>
            day.mood_average
          }
          label={t("insights.mood")}
          maximum={5}
          emptyLabel={t(
            "insights.noRecordedData",
          )}
          trendLabel={t(
            "insights.trend",
          )}
        />

        <MetricChart
          days={days}
          description={t("insights.energyDescription")}
          getValue={(day) =>
            day.energy_average
          }
          label={t("insights.energy")}
          maximum={5}
          emptyLabel={t(
            "insights.noRecordedData",
          )}
          trendLabel={t(
            "insights.trend",
          )}
        />

        <MetricChart
          days={days}
          description={t("insights.stressDescription")}
          getValue={(day) =>
            day.stress_average
          }
          label={t("insights.stress")}
          maximum={5}
          emptyLabel={t(
            "insights.noRecordedData",
          )}
          trendLabel={t(
            "insights.trend",
          )}
        />

        <FocusChart
          days={days}
          maximum={
            maximumFocusMinutes
          }
          emptyLabel={t(
            "insights.noFocus",
          )}
          focusLabel={t(
            "insights.focusTime",
          )}
          description={t(
            "insights.focusDescription",
          )}
          trendLabel={t(
            "insights.trend",
          )}
        />
      </section>

      <section className="insights-suggestions-card">
        <p className="eyebrow">
          {t("insights.observations")}
        </p>

        <h2>
          {t("insights.patterns")}
        </h2>

        <p className="insights-suggestions-intro">
          {t("insights.observationDescription")}
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
            {t("insights.weeklyDetail")}
          </p>

          <h2>
            {t("insights.daySummary")}
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
                      locale,
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
                  {t("insights.stress")}{" "}
                  {day.stress_average
                    ?? "—"}
                </span>

                <span>
                  {
                    day.focus_minutes
                  }{" "}
                  {t(
                    "insights.minutes",
                    {
                      value:
                        day.focus_minutes,
                    },
                  )}
                </span>

                <span>
                  {t(
                    day.reflections === 1
                      ? "insights.reflectionSingle"
                      : "insights.reflectionPlural",
                    {
                      value:
                        day.reflections,
                    },
                  )}
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
  trendLabel,
  emptyLabel,
}: {
  days: DailyInsightPoint[];
  label: string;
  description: string;
  maximum: number;
  getValue: (
    day: DailyInsightPoint,
  ) => number | null;
  trendLabel: string;
  emptyLabel: string;
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
          {trendLabel}
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
          {emptyLabel}
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
  trendLabel,
  focusLabel,
  description,
  emptyLabel,
}: {
  days: DailyInsightPoint[];
  maximum: number;
  trendLabel: string;
  focusLabel: string;
  description: string;
  emptyLabel: string;
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
          {trendLabel}
        </p>

        <h2>
          {focusLabel}
        </h2>

        <p>
          {description}
        </p>
      </div>

      {!hasData ? (
        <div className="insights-empty-chart">
          {emptyLabel}
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
