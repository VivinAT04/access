"use client";

import {
  FormEvent,
  useMemo,
  useState,
} from "react";

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
  } = useLanguage();

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
      "Language and reading preferences saved.",
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
        "Enter a locale such as en-GB, ta-IN or ar-SA.",
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
        Loading language preferences...
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
            Current language
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
              Language selection
            </p>

            <h2>
              Choose your preferred language
            </h2>

            <p>
              Language names are shown in
              English and in their native
              form.
            </p>
          </div>

          <input
            aria-label="Search languages"
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="Search languages"
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
            No matching listed language.
            You can enter a custom locale
            below.
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
            Other languages
          </p>

          <h2>
            Enter a custom locale
          </h2>

          <p>
            Use a standard language code
            such as <code>en-US</code>,
            <code>ta-LK</code> or
            <code>zh-Hant-TW</code>.
          </p>
        </div>

        <div className="custom-locale-form">
          <input
            onChange={(event) =>
              setCustomLocale(
                event.target.value,
              )
            }
            placeholder="Example: en-US"
            value={customLocale}
          />

          <button
            className="button button-primary"
            disabled={isSaving}
            type="submit"
          >
            Use locale
          </button>
        </div>
      </form>

      <section className="reading-support-grid">
        <ReadingSettingCard
          description="Control the space between letters."
          label="Letter spacing"
        >
          <div className="reading-option-row">
            {(
              [
                [
                  "normal",
                  "Normal",
                ],
                [
                  "relaxed",
                  "Relaxed",
                ],
                [
                  "wide",
                  "Wide",
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
          description="Use a clearer, heavier system font style."
          label="Dyslexia-friendly text"
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
              ? "Enabled"
              : "Enable"}
          </button>
        </ReadingSettingCard>

        <ReadingSettingCard
          description="Show a horizontal guide that follows the pointer."
          label="Reading guide"
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
              ? "Enabled"
              : "Enable"}
          </button>
        </ReadingSettingCard>

        <ReadingSettingCard
          description="Override automatic text direction when necessary."
          label="Text direction"
        >
          <div className="reading-option-row">
            {(
              [
                [
                  "auto",
                  "Automatic",
                ],
                [
                  "ltr",
                  "Left to right",
                ],
                [
                  "rtl",
                  "Right to left",
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
          Locale preview
        </p>

        <h2>
          {selectedName}
        </h2>

        <div className="language-preview-grid">
          <article>
            <span>
              Date
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
              Time
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
              Number
            </span>

            <strong>
              {formatNumber(
                1234567.89,
              )}
            </strong>
          </article>

          <article>
            <span>
              Percentage
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
          Pages without a verified
          translation remain in English,
          while dates, times, numbers and
          text direction use your selected
          locale.
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
