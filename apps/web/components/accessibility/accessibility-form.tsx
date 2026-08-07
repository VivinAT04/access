"use client";

import { useState } from "react";

import { phase2Text } from "@/components/i18n/phase2-translations";
import { useLanguage } from "@/components/language/language-provider";
import { useAccessibility } from "@/components/accessibility/accessibility-provider";
import type {
  AccessibilityPreferenceUpdate,
  FontSize,
} from "@/lib/types";


interface ToggleOption {
  key: Exclude<
    keyof AccessibilityPreferenceUpdate,
    "font_size"
  >;
  title: string;
  description: string;
}


const toggleOptions: ToggleOption[] = [
  {
    key: "high_contrast",
    title: "High contrast",
    description:
      "Increase the visual difference between text, controls and backgrounds.",
  },
  {
    key: "reduced_motion",
    title: "Reduced motion",
    description:
      "Remove or minimise animations and movement.",
  },
  {
    key: "dyslexia_friendly_font",
    title: "Dyslexia-friendly text",
    description:
      "Use clearer letter spacing and a highly readable font style.",
  },
  {
    key: "increased_spacing",
    title: "Increased spacing",
    description:
      "Add more space between lines, words, controls and sections.",
  },
  {
    key: "simplified_interface",
    title: "Simplified interface",
    description:
      "Reduce decorative elements and visual complexity.",
  },
  {
    key: "screen_reader_optimised",
    title: "Screen-reader optimisation",
    description:
      "Prioritise clearer descriptions, labels and navigation landmarks.",
  },
];


const fontSizes: Array<{
  value: FontSize;
  label: string;
}> = [
  {
    value: "small",
    label: "Small",
  },
  {
    value: "medium",
    label: "Medium",
  },
  {
    value: "large",
    label: "Large",
  },
  {
    value: "extra-large",
    label: "Extra large",
  },
];


export function AccessibilityForm() {
  const { locale } = useLanguage();

  const t = (key: string) =>
    phase2Text(locale, key);

  const {
    preferences,
    isLoading,
    updatePreferences,
  } = useAccessibility();

  const [draftPreferences, setDraftPreferences] =
    useState<AccessibilityPreferenceUpdate | null>(null);

  const [status, setStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const form = draftPreferences ?? preferences;

  function updateFontSize(fontSize: FontSize) {
    setStatus("");

    setDraftPreferences({
      ...form,
      font_size: fontSize,
    });
  }

  function updateToggle(
    key: ToggleOption["key"],
    checked: boolean,
  ) {
    setStatus("");

    setDraftPreferences({
      ...form,
      [key]: checked,
    });
  }

  async function savePreferences() {
    setStatus("");
    setIsSaving(true);

    const success = await updatePreferences(form);

    if (success) {
      setDraftPreferences(null);
    }

    setStatus(
      success
        ? t("accessibility.saved")
        : t("accessibility.saveFailed"),
    );

    setIsSaving(false);
  }

  async function resetPreferences() {
    const defaults: AccessibilityPreferenceUpdate = {
      font_size: "medium",
      high_contrast: false,
      reduced_motion: false,
      dyslexia_friendly_font: false,
      increased_spacing: false,
      simplified_interface: false,
      screen_reader_optimised: false,
    };

    setStatus("");
    setIsSaving(true);

    const success = await updatePreferences(defaults);

    if (success) {
      setDraftPreferences(null);
    } else {
      setDraftPreferences(defaults);
    }

    setStatus(
      success
        ? t("accessibility.reset")
        : t("accessibility.resetFailed"),
    );

    setIsSaving(false);
  }

  if (isLoading) {
    return (
      <div
        className="accessibility-loading"
        role="status"
      >
        {t("accessibility.loading")}
      </div>
    );
  }

  return (
    <div className="accessibility-settings-layout">
      <section className="accessibility-controls">
        <div className="settings-section">
          <p className="eyebrow">
            {t("accessibility.textDisplay")}
          </p>

          <h2>
            {t("accessibility.textSize")}
          </h2>

          <p className="settings-description">
            {t("accessibility.textSizeDescription")}
          </p>

          <div
            className="font-size-options"
            role="radiogroup"
            aria-label="Text size"
          >
            {fontSizes.map((option) => (
              <button
                aria-checked={
                  form.font_size === option.value
                }
                className={`font-size-option ${
                  form.font_size === option.value
                    ? "font-size-option-selected"
                    : ""
                }`}
                key={option.value}
                onClick={() =>
                  updateFontSize(option.value)
                }
                role="radio"
                type="button"
              >
                {t(
                  `accessibility.${option.value === "extra-large"
                    ? "extraLarge"
                    : option.value}`,
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="settings-section">
          <p className="eyebrow">
            {t("accessibility.experience")}
          </p>

          <h2>
            {t("accessibility.interface")}
          </h2>

          <p className="settings-description">
            {t("accessibility.interfaceDescription")}
          </p>

          <div className="accessibility-toggle-list">
            {toggleOptions.map((option) => (
              <label
                className="accessibility-toggle-card"
                key={option.key}
              >
                <span>
                  <strong>
                    {t(
                      option.key === "high_contrast"
                        ? "accessibility.highContrast"
                        : option.key === "reduced_motion"
                          ? "accessibility.reducedMotion"
                          : option.key === "dyslexia_friendly_font"
                            ? "accessibility.dyslexia"
                            : option.key === "increased_spacing"
                              ? "accessibility.spacing"
                              : option.key === "simplified_interface"
                                ? "accessibility.simplified"
                                : "accessibility.screenReader",
                    )}
                  </strong>

                  <small>
                    {t(
                      option.key === "high_contrast"
                        ? "accessibility.highContrastDescription"
                        : option.key === "reduced_motion"
                          ? "accessibility.reducedMotionDescription"
                          : option.key === "dyslexia_friendly_font"
                            ? "accessibility.dyslexiaDescription"
                            : option.key === "increased_spacing"
                              ? "accessibility.spacingDescription"
                              : option.key === "simplified_interface"
                                ? "accessibility.simplifiedDescription"
                                : "accessibility.screenReaderDescription",
                    )}
                  </small>
                </span>

                <input
                  checked={Boolean(form[option.key])}
                  onChange={(event) =>
                    updateToggle(
                      option.key,
                      event.target.checked,
                    )
                  }
                  type="checkbox"
                />

                <span
                  aria-hidden="true"
                  className="toggle-visual"
                />
              </label>
            ))}
          </div>
        </div>

        <div className="settings-actions">
          <button
            className="button button-primary"
            disabled={isSaving}
            onClick={savePreferences}
            type="button"
          >
            {isSaving
              ? t("common.saving")
              : t("accessibility.save")}
          </button>

          <button
            className="button button-secondary"
            disabled={isSaving}
            onClick={resetPreferences}
            type="button"
          >
            {t("accessibility.resetDefault")}
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
          {t("accessibility.preview")}
        </p>

        <h2>
          {t("accessibility.previewTitle")}
        </h2>

        <p>
          {t("accessibility.previewDescription")}
        </p>

        <div className="preview-task">
          <span aria-hidden="true">✓</span>

          <div>
            <strong>
              {t("accessibility.previewTask")}
            </strong>
            <small>
              {t("accessibility.previewTaskDescription")}
            </small>
          </div>
        </div>

        <button
          className="button button-primary"
          type="button"
        >
          {t("accessibility.example")}
        </button>
      </aside>
    </div>
  );
}
