"use client";

import {
  FormEvent,
  useMemo,
  useState,
} from "react";

import { phase2Text } from "@/components/i18n/phase2-translations";

import {
  findLanguage,
  getDirection,
  getLanguageName,
  languageOptions,
} from "@/components/language/language-options";

import {
  useLanguage,
} from "@/components/language/language-provider";

import type {
  LanguagePreference,
  ReadingLetterSpacing,
  TextDirection,
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


function getError(
  data: unknown,
): string {
  if (
    typeof data === "object"
    && data !== null
    && "detail" in data
    && typeof data.detail
      === "string"
  ) {
    return data.detail;
  }

  if (
    typeof data === "object"
    && data !== null
    && "message" in data
    && typeof data.message
      === "string"
  ) {
    return data.message;
  }

  return (
    "Language preferences "
    + "could not be saved."
  );
}


export function LanguageReadingManager() {
  const {
    preference,
    setPreference,
    formatDate,
    formatNumber,
    locale,
  } = useLanguage();

  const t = (
    key: string,
    values: Record<string, string | number> = {},
  ) => phase2Text(
    locale,
    key,
    values,
  );

  const [search, setSearch] =
    useState("");

  const [
    customLocale,
    setCustomLocale,
  ] = useState("");

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [isSaving, setIsSaving] =
    useState(false);


  const filteredLanguages =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return languageOptions;
      }

      return languageOptions.filter(
        (language) =>
          language.name
            .toLowerCase()
            .includes(query)
          || language.nativeName
            .toLowerCase()
            .includes(query)
          || language.locale
            .toLowerCase()
            .includes(query),
      );
    }, [search]);


  async function saveUpdates(
    updates:
      Partial<LanguagePreference>,
  ) {
    if (!preference) {
      return;
    }

    setIsSaving(true);
    setError("");
    setMessage("");

    const response =
      await fetch(
        "/api/language-preferences",
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(
            updates,
          ),
        },
      );

    const data =
      await readJson(response);

    if (!response.ok) {
      setError(
        getError(data),
      );

      setIsSaving(false);

      return;
    }

    const saved =
      data as LanguagePreference;

    setPreference(saved);

    setMessage(
      t("language.saved"),
    );

    setIsSaving(false);
  }


  function chooseLanguage(
    locale: string,
  ) {
    const language =
      findLanguage(locale);

    void saveUpdates({
      locale,
      direction:
        language?.direction
        ?? getDirection(locale),
    });
  }


  function submitCustomLocale(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const cleaned =
      customLocale.trim();

    if (!cleaned) {
      setError(
        t("language.localeRequired"),
      );

      return;
    }

    void saveUpdates({
      locale: cleaned,
      direction:
        getDirection(cleaned),
    });
  }


  if (!preference) {
    return (
      <section className="language-loading-card">
        {t("language.loading")}
      </section>
    );
  }


  const selectedLanguage =
    findLanguage(
      preference.locale,
    );

  const selectedName =
    selectedLanguage?.name
    ?? getLanguageName(
      preference.locale,
    );


  return (
    <>
      {message ? (
        <p className="task-message task-success">
          {message}
        </p>
      ) : null}

      {error ? (
        <p className="task-message task-error">
          {error}
        </p>
      ) : null}

      <section className="language-current-card">
        <div>
          <p className="eyebrow">
            {t("language.current")}
          </p>

          <h2>
            {selectedName}
          </h2>

          <p>
            {selectedLanguage
              ? selectedLanguage
                  .nativeName
              : preference.locale}
          </p>
        </div>

        <div className="language-current-meta">
          <span>
            {preference.locale}
          </span>

          <span>
            {documentDirection(
              preference,
            ).toUpperCase()}
          </span>
        </div>
      </section>

      <section className="language-selector-card">
        <div className="language-section-heading">
          <div>
            <p className="eyebrow">
              {t("language.selection")}
            </p>

            <h2>
              {t("language.choose")}
            </h2>

            <p>
              {t("language.chooseDescription")}
            </p>
          </div>

          <input
            aria-label={t("language.search")}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder={t("language.search")}
            type="search"
            value={search}
          />
        </div>

        <div className="language-grid">
          {filteredLanguages.map(
            (language) => {
              const selected =
                language.locale
                === preference.locale;

              return (
                <button
                  aria-pressed={
                    selected
                  }
                  className={
                    selected
                      ? "language-option language-option-selected"
                      : "language-option"
                  }
                  disabled={isSaving}
                  key={
                    language.locale
                  }
                  onClick={() =>
                    chooseLanguage(
                      language.locale,
                    )
                  }
                  type="button"
                >
                  <strong>
                    {language.name}
                  </strong>

                  <span
                    dir={
                      language.direction
                    }
                  >
                    {
                      language.nativeName
                    }
                  </span>

                  <small>
                    {language.locale}
                  </small>
                </button>
              );
            },
          )}
        </div>

        {filteredLanguages.length
        === 0 ? (
          <div className="language-empty">
            {t("language.noMatch")}
          </div>
        ) : null}
      </section>

      <form
        className="custom-locale-card"
        onSubmit={
          submitCustomLocale
        }
      >
        <div>
          <p className="eyebrow">
            {t("language.other")}
          </p>

          <h2>
            {t("language.custom")}
          </h2>

          <p>
            {t("language.customDescription")}
          </p>
        </div>

        <div className="custom-locale-form">
          <input
            onChange={(event) =>
              setCustomLocale(
                event.target.value,
              )
            }
            placeholder={t("language.exampleLocale")}
            value={customLocale}
          />

          <button
            className="button button-primary"
            disabled={isSaving}
            type="submit"
          >
            {t("language.useLocale")}
          </button>
        </div>
      </form>

      <section className="reading-support-grid">
        <ReadingSettingCard
          description={t(
            "language.letterSpacingDescription",
          )}
          label={t(
            "language.letterSpacing",
          )}
        >
          <div className="reading-option-row">
            {(
              [
                [
                  "normal",
                  t("language.normal"),
                ],
                [
                  "relaxed",
                  t("language.relaxed"),
                ],
                [
                  "wide",
                  t("language.wide"),
                ],
              ] as Array<
                [
                  ReadingLetterSpacing,
                  string,
                ]
              >
            ).map(
              ([
                value,
                label,
              ]) => (
                <button
                  aria-pressed={
                    preference
                      .letter_spacing
                    === value
                  }
                  className={
                    preference
                      .letter_spacing
                    === value
                      ? "reading-option-selected"
                      : ""
                  }
                  key={value}
                  onClick={() =>
                    void saveUpdates({
                      letter_spacing:
                        value,
                    })
                  }
                  type="button"
                >
                  {label}
                </button>
              ),
            )}
          </div>
        </ReadingSettingCard>

        <ReadingSettingCard
          description={t(
            "language.dyslexiaDescription",
          )}
          label={t(
            "language.dyslexia",
          )}
        >
          <button
            aria-pressed={
              preference
                .dyslexia_friendly
            }
            className={
              preference
                .dyslexia_friendly
                ? "button button-primary"
                : "button button-secondary"
            }
            onClick={() =>
              void saveUpdates({
                dyslexia_friendly:
                  !preference
                    .dyslexia_friendly,
              })
            }
            type="button"
          >
            {preference
              .dyslexia_friendly
              ? t("common.enabled")
              : t("common.enable")}
          </button>
        </ReadingSettingCard>

        <ReadingSettingCard
          description={t(
            "language.readingGuideDescription",
          )}
          label={t(
            "language.readingGuide",
          )}
        >
          <button
            aria-pressed={
              preference
                .reading_guide
            }
            className={
              preference
                .reading_guide
                ? "button button-primary"
                : "button button-secondary"
            }
            onClick={() =>
              void saveUpdates({
                reading_guide:
                  !preference
                    .reading_guide,
              })
            }
            type="button"
          >
            {preference
              .reading_guide
              ? t("common.enabled")
              : t("common.enable")}
          </button>
        </ReadingSettingCard>

        <ReadingSettingCard
          description={t(
            "language.textDirectionDescription",
          )}
          label={t(
            "language.textDirection",
          )}
        >
          <div className="reading-option-row">
            {(
              [
                [
                  "auto",
                  t("language.auto"),
                ],
                [
                  "ltr",
                  t("language.ltr"),
                ],
                [
                  "rtl",
                  t("language.rtl"),
                ],
              ] as Array<
                [
                  TextDirection,
                  string,
                ]
              >
            ).map(
              ([
                value,
                label,
              ]) => (
                <button
                  aria-pressed={
                    preference
                      .direction
                    === value
                  }
                  className={
                    preference
                      .direction
                    === value
                      ? "reading-option-selected"
                      : ""
                  }
                  key={value}
                  onClick={() =>
                    void saveUpdates({
                      direction:
                        value,
                    })
                  }
                  type="button"
                >
                  {label}
                </button>
              ),
            )}
          </div>
        </ReadingSettingCard>
      </section>

      <section className="language-preview-card">
        <p className="eyebrow">
          {t("language.preview")}
        </p>

        <h2>
          {selectedName}
        </h2>

        <div className="language-preview-grid">
          <article>
            <span>
              {t("language.date")}
            </span>

            <strong>
              {formatDate(
                new Date(),
                {
                  dateStyle:
                    "full",
                },
              )}
            </strong>
          </article>

          <article>
            <span>
              {t("language.time")}
            </span>

            <strong>
              {formatDate(
                new Date(),
                {
                  timeStyle:
                    "short",
                },
              )}
            </strong>
          </article>

          <article>
            <span>
              {t("language.number")}
            </span>

            <strong>
              {formatNumber(
                1234567.89,
              )}
            </strong>
          </article>

          <article>
            <span>
              {t("language.percentage")}
            </span>

            <strong>
              {formatNumber(
                0.72,
                {
                  style:
                    "percent",
                },
              )}
            </strong>
          </article>
        </div>

        <p className="language-fallback-note">
          {t("language.fallback")}
        </p>
      </section>

      {preference.reading_guide ? (
        <ReadingGuide />
      ) : null}
    </>
  );
}


function documentDirection(
  preference:
    LanguagePreference,
): "ltr" | "rtl" {
  if (
    preference.direction
    !== "auto"
  ) {
    return preference.direction;
  }

  return getDirection(
    preference.locale,
  );
}


function ReadingSettingCard({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="reading-setting-card">
      <h2>
        {label}
      </h2>

      <p>
        {description}
      </p>

      {children}
    </section>
  );
}


function ReadingGuide() {
  const [top, setTop] =
    useState(() => {
      if (
        typeof window
        === "undefined"
      ) {
        return 0;
      }

      return (
        window.innerHeight
        / 2
      );
    });

  return (
    <div
      aria-hidden="true"
      className="global-reading-guide"
      onMouseMove={(event) =>
        setTop(
          event.clientY,
        )
      }
      style={{
        "--reading-guide-top":
          `${top}px`,
      } as React.CSSProperties}
    />
  );
}
