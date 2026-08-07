"use client";

import {
  useState,
} from "react";

import {
  useAccessibility,
} from "@/components/accessibility/accessibility-provider";
import {
  phase2Text,
} from "@/components/i18n/phase2-translations";
import {
  useLanguage,
} from "@/components/language/language-provider";
import type {
  AccessibilityPreferenceUpdate,
  FontSize,
} from "@/lib/types";


type ToggleKey =
  | "high_contrast"
  | "reduced_motion"
  | "dyslexia_friendly_font"
  | "increased_spacing"
  | "simplified_interface"
  | "screen_reader_optimised";


interface ToggleOption {
  key: ToggleKey;
}


const toggleOptions:
  ToggleOption[] = [
    {
      key:
        "high_contrast",
    },
    {
      key:
        "reduced_motion",
    },
    {
      key:
        "dyslexia_friendly_font",
    },
    {
      key:
        "increased_spacing",
    },
    {
      key:
        "simplified_interface",
    },
    {
      key:
        "screen_reader_optimised",
    },
  ];


const fontSizes: FontSize[] = [
  "small",
  "medium",
  "large",
  "extra-large",
];


const palettes = [
  {
    key: "Calm",
    accent:
      "#6d5dfc",
    surface:
      "#ffffff",
  },
  {
    key: "Forest",
    accent:
      "#3f7d5a",
    surface:
      "#f4faf6",
  },
  {
    key: "Ocean",
    accent:
      "#2979a8",
    surface:
      "#f2f9fc",
  },
  {
    key: "Warm",
    accent:
      "#a86635",
    surface:
      "#fff8f0",
  },
] as const;


function toggleTitleKey(
  key: ToggleKey,
): string {
  const keys:
    Record<
      ToggleKey,
      string
    > = {
      high_contrast:
        "accessibility.highContrast",

      reduced_motion:
        "accessibility.reducedMotion",

      dyslexia_friendly_font:
        "accessibility.dyslexia",

      increased_spacing:
        "accessibility.spacing",

      simplified_interface:
        "accessibility.simplified",

      screen_reader_optimised:
        "accessibility.screenReader",
    };

  return keys[key];
}


function toggleDescriptionKey(
  key: ToggleKey,
): string {
  const keys:
    Record<
      ToggleKey,
      string
    > = {
      high_contrast:
        "accessibility.highContrastDescription",

      reduced_motion:
        "accessibility.reducedMotionDescription",

      dyslexia_friendly_font:
        "accessibility.dyslexiaDescription",

      increased_spacing:
        "accessibility.spacingDescription",

      simplified_interface:
        "accessibility.simplifiedDescription",

      screen_reader_optimised:
        "accessibility.screenReaderDescription",
    };

  return keys[key];
}


export function AccessibilityForm() {
  const {
    locale,
  } = useLanguage();

  const t = (
    key: string,
  ) =>
    phase2Text(
      locale,
      key,
    );

  const {
    preferences,
    isLoading,
    updatePreferences,
  } = useAccessibility();

  const [
    draftPreferences,
    setDraftPreferences,
  ] =
    useState<
      AccessibilityPreferenceUpdate
      | null
    >(null);

  const [
    status,
    setStatus,
  ] =
    useState("");

  const [
    isSaving,
    setIsSaving,
  ] =
    useState(false);

  const form =
    draftPreferences
    ?? preferences;


  function updateFontSize(
    fontSize: FontSize,
  ) {
    setStatus("");

    setDraftPreferences({
      ...form,
      font_size:
        fontSize,
    });
  }


  function updateToggle(
    key: ToggleKey,
    checked: boolean,
  ) {
    setStatus("");

    setDraftPreferences({
      ...form,
      [key]:
        checked,
    });
  }


  function updateColour(
    key:
      | "accent_colour"
      | "surface_colour",
    value: string,
  ) {
    setStatus("");

    const updated = {
      ...form,
      [key]:
        value,
    };

    setDraftPreferences(
      updated,
    );
  }


  function choosePalette(
    accent: string,
    surface: string,
  ) {
    setStatus("");

    setDraftPreferences({
      ...form,
      accent_colour:
        accent,
      surface_colour:
        surface,
    });
  }


  async function savePreferences() {
    setStatus("");
    setIsSaving(true);

    const success =
      await updatePreferences(
        form,
      );

    if (success) {
      setDraftPreferences(
        null,
      );
    }

    setStatus(
      success
        ? t(
            "accessibility.saved",
          )
        : t(
            "accessibility.saveFailed",
          ),
    );

    setIsSaving(false);
  }


  async function resetPreferences() {
    const defaults:
      AccessibilityPreferenceUpdate = {
        font_size:
          "medium",

        accent_colour:
          "#6d5dfc",

        surface_colour:
          "#ffffff",

        high_contrast:
          false,

        reduced_motion:
          false,

        dyslexia_friendly_font:
          false,

        increased_spacing:
          false,

        simplified_interface:
          false,

        screen_reader_optimised:
          false,
      };

    setStatus("");
    setIsSaving(true);

    const success =
      await updatePreferences(
        defaults,
      );

    if (success) {
      setDraftPreferences(
        null,
      );
    } else {
      setDraftPreferences(
        defaults,
      );
    }

    setStatus(
      success
        ? t(
            "accessibility.reset",
          )
        : t(
            "accessibility.resetFailed",
          ),
    );

    setIsSaving(false);
  }


  if (isLoading) {
    return (
      <div
        className="accessibility-loading"
        role="status"
      >
        {t(
          "accessibility.loading",
        )}
      </div>
    );
  }


  return (
    <div className="accessibility-settings-layout">
      <section className="accessibility-controls">

        <div className="settings-section">
          <p className="eyebrow">
            {t(
              "accessibility.textDisplay",
            )}
          </p>

          <h2>
            {t(
              "accessibility.textSize",
            )}
          </h2>

          <p className="settings-description">
            {t(
              "accessibility.textSizeDescription",
            )}
          </p>

          <div
            aria-label={t(
              "accessibility.textSize",
            )}
            className="font-size-options"
            role="radiogroup"
          >
            {fontSizes.map(
              (
                option,
              ) => (
                <button
                  aria-checked={
                    form.font_size
                    === option
                  }
                  className={
                    `font-size-option ${
                      form.font_size
                      === option
                        ? "font-size-option-selected"
                        : ""
                    }`
                  }
                  key={
                    option
                  }
                  onClick={() =>
                    updateFontSize(
                      option,
                    )
                  }
                  role="radio"
                  type="button"
                >
                  {t(
                    `accessibility.${
                      option
                      === "extra-large"
                        ? "extraLarge"
                        : option
                    }`,
                  )}
                </button>
              ),
            )}
          </div>
        </div>


        <div className="settings-section">
          <p className="eyebrow">
            {t(
              "accessibility.colours",
            )}
          </p>

          <h2>
            {t(
              "accessibility.customColours",
            )}
          </h2>

          <p className="settings-description">
            {t(
              "accessibility.customColoursDescription",
            )}
          </p>

          <div className="accessibility-colour-grid">
            <label className="accessibility-colour-field">
              <span>
                {t(
                  "accessibility.accentColour",
                )}
              </span>

              <div className="accessibility-colour-control">
                <input
                  aria-label={t(
                    "accessibility.accentColour",
                  )}
                  onChange={(
                    event,
                  ) =>
                    updateColour(
                      "accent_colour",
                      event
                        .target
                        .value,
                    )
                  }
                  type="color"
                  value={
                    form
                      .accent_colour
                    ?? "#6d5dfc"
                  }
                />

                <code>
                  {
                    form
                      .accent_colour
                    ?? "#6d5dfc"
                  }
                </code>
              </div>
            </label>

            <label className="accessibility-colour-field">
              <span>
                {t(
                  "accessibility.surfaceColour",
                )}
              </span>

              <div className="accessibility-colour-control">
                <input
                  aria-label={t(
                    "accessibility.surfaceColour",
                  )}
                  onChange={(
                    event,
                  ) =>
                    updateColour(
                      "surface_colour",
                      event
                        .target
                        .value,
                    )
                  }
                  type="color"
                  value={
                    form
                      .surface_colour
                    ?? "#ffffff"
                  }
                />

                <code>
                  {
                    form
                      .surface_colour
                    ?? "#ffffff"
                  }
                </code>
              </div>
            </label>
          </div>

          <div className="accessibility-colour-presets">
            {palettes.map(
              (
                palette,
              ) => (
                <button
                  className="accessibility-palette-button"
                  key={
                    palette.key
                  }
                  onClick={() =>
                    choosePalette(
                      palette
                        .accent,
                      palette
                        .surface,
                    )
                  }
                  type="button"
                >
                  <span
                    aria-hidden="true"
                    className="accessibility-palette-preview"
                  >
                    <i
                      style={{
                        background:
                          palette
                            .accent,
                      }}
                    />

                    <i
                      style={{
                        background:
                          palette
                            .surface,
                      }}
                    />
                  </span>

                  {t(
                    `accessibility.palette${palette.key}`,
                  )}
                </button>
              ),
            )}
          </div>
        </div>


        <div className="settings-section">
          <p className="eyebrow">
            {t(
              "accessibility.experience",
            )}
          </p>

          <h2>
            {t(
              "accessibility.interface",
            )}
          </h2>

          <p className="settings-description">
            {t(
              "accessibility.interfaceDescription",
            )}
          </p>

          <div className="accessibility-toggle-list">
            {toggleOptions.map(
              (
                option,
              ) => (
                <label
                  className="accessibility-toggle-card"
                  key={
                    option.key
                  }
                >
                  <span>
                    <strong>
                      {t(
                        toggleTitleKey(
                          option.key,
                        ),
                      )}
                    </strong>

                    <small>
                      {t(
                        toggleDescriptionKey(
                          option.key,
                        ),
                      )}
                    </small>
                  </span>

                  <input
                    checked={
                      Boolean(
                        form[
                          option.key
                        ],
                      )
                    }
                    onChange={(
                      event,
                    ) =>
                      updateToggle(
                        option.key,
                        event
                          .target
                          .checked,
                      )
                    }
                    type="checkbox"
                  />

                  <span
                    aria-hidden="true"
                    className="toggle-visual"
                  />
                </label>
              ),
            )}
          </div>
        </div>


        <div className="settings-actions">
          <button
            className="button button-primary"
            disabled={
              isSaving
            }
            onClick={
              savePreferences
            }
            type="button"
          >
            {
              isSaving
                ? t(
                    "common.saving",
                  )
                : t(
                    "accessibility.save",
                  )
            }
          </button>

          <button
            className="button button-secondary"
            disabled={
              isSaving
            }
            onClick={
              resetPreferences
            }
            type="button"
          >
            {t(
              "accessibility.resetDefault",
            )}
          </button>
        </div>

        {status ? (
          <p
            className="settings-status"
            role="status"
          >
            {status}
          </p>
        ) : null}
      </section>


      <aside className="accessibility-preview">
        <p className="eyebrow">
          {t(
            "accessibility.preview",
          )}
        </p>

        <h2>
          {t(
            "accessibility.previewTitle",
          )}
        </h2>

        <p>
          {t(
            "accessibility.previewDescription",
          )}
        </p>

        <div className="preview-task">
          <span
            aria-hidden="true"
          >
            ✓
          </span>

          <div>
            <strong>
              {t(
                "accessibility.previewTask",
              )}
            </strong>

            <small>
              {t(
                "accessibility.previewTaskDescription",
              )}
            </small>
          </div>
        </div>

        <button
          className="button button-primary"
          type="button"
        >
          {t(
            "accessibility.example",
          )}
        </button>
      </aside>
    </div>
  );
}
