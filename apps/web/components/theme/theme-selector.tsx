"use client";

import {
  type ThemePreference,
  useTheme,
} from "@/components/theme/theme-provider";


interface ThemeOption {
  value: ThemePreference;
  label: string;
  description: string;
  icon: string;
}


const options: ThemeOption[] = [
  {
    value: "light",
    label: "Light",
    description:
      "Always use the light theme.",
    icon: "☀",
  },
  {
    value: "dark",
    label: "Dark",
    description:
      "Always use the dark theme.",
    icon: "◐",
  },
  {
    value: "system",
    label: "System",
    description:
      "Match your device appearance.",
    icon: "◫",
  },
];


export function ThemeSelector() {
  const {
    theme,
    resolvedTheme,
    setTheme,
  } = useTheme();

  return (
    <section className="theme-settings-card">
      <div>
        <p className="eyebrow">
          Appearance
        </p>

        <h2>
          Choose your theme
        </h2>

        <p className="theme-settings-description">
          Your choice is saved on this
          device and applies across the
          whole Aksess website.
        </p>
      </div>

      <div
        aria-label="Theme preference"
        className="theme-options"
        role="radiogroup"
      >
        {options.map(
          (option) => (
            <button
              aria-checked={
                theme ===
                option.value
              }
              className={
                theme ===
                option.value
                  ? "theme-option theme-option-selected"
                  : "theme-option"
              }
              key={
                option.value
              }
              onClick={() =>
                setTheme(
                  option.value,
                )
              }
              role="radio"
              type="button"
            >
              <span
                aria-hidden="true"
                className="theme-option-icon"
              >
                {option.icon}
              </span>

              <span>
                <strong>
                  {option.label}
                </strong>

                <small>
                  {
                    option.description
                  }
                </small>
              </span>

              <span
                aria-hidden="true"
                className="theme-option-check"
              >
                {theme ===
                option.value
                  ? "✓"
                  : ""}
              </span>
            </button>
          ),
        )}
      </div>

      <p className="theme-current-value">
        Current appearance:{" "}
        <strong>
          {resolvedTheme ===
          "dark"
            ? "Dark"
            : "Light"}
        </strong>
      </p>
    </section>
  );
}
