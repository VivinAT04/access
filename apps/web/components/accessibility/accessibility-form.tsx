"use client";

import { useState } from "react";

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
        ? "Your accessibility preferences have been saved."
        : "Your preferences could not be saved. Please try again.",
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
        ? "Accessibility preferences reset to default."
        : "The preferences could not be reset.",
    );

    setIsSaving(false);
  }

  if (isLoading) {
    return (
      <div
        className="accessibility-loading"
        role="status"
      >
        Loading accessibility preferences...
      </div>
    );
  }

  return (
    <div className="accessibility-settings-layout">
      <section className="accessibility-controls">
        <div className="settings-section">
          <p className="eyebrow">Text display</p>
          <h2>Text size</h2>

          <p className="settings-description">
            Choose a comfortable default text size across
            Aksess.
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
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="settings-section">
          <p className="eyebrow">Experience</p>
          <h2>Interface preferences</h2>

          <p className="settings-description">
            Turn on the settings that make Aksess easier and
            more comfortable to use.
          </p>

          <div className="accessibility-toggle-list">
            {toggleOptions.map((option) => (
              <label
                className="accessibility-toggle-card"
                key={option.key}
              >
                <span>
                  <strong>{option.title}</strong>
                  <small>{option.description}</small>
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
              ? "Saving..."
              : "Save preferences"}
          </button>

          <button
            className="button button-secondary"
            disabled={isSaving}
            onClick={resetPreferences}
            type="button"
          >
            Reset to default
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
        <p className="eyebrow">Live preview</p>
        <h2>A space that works for you.</h2>

        <p>
          Your selected preferences will apply throughout
          Aksess after you save them.
        </p>

        <div className="preview-task">
          <span aria-hidden="true">✓</span>

          <div>
            <strong>Take one manageable step</strong>
            <small>
              Break larger activities into clear and
              comfortable actions.
            </small>
          </div>
        </div>

        <button
          className="button button-primary"
          type="button"
        >
          Example action
        </button>
      </aside>
    </div>
  );
}
