"use client";

import { phase2Text } from "@/components/i18n/phase2-translations";
import { useLanguage } from "@/components/language/language-provider";

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
  const { locale } = useLanguage();

  const t = (
    key: string,
    values: Record<string, string | number> = {},
  ) => phase2Text(
    locale,
    key,
    values,
  );

  const {
    theme,
    resolvedTheme,
    setTheme,
  } = useTheme();

  return (
    <section className="theme-settings-card">
      <div>
        <p className="eyebrow">
          {t("theme.appearance")}
        </p>

        <h2>
          {t("theme.title")}
        </h2>

        <p className="theme-settings-description">
          {t("theme.description")}
        </p>
      </div>

      <div
        aria-label={t("theme.preference")}
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
                  {t(
                    `theme.${option.value}`,
                  )}
                </strong>

                <small>
                  {
                    t(
                      `theme.${option.value}Description`,
                    )
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
        {t(
          "theme.current",
          {
            value:
              resolvedTheme ===
              "dark"
                ? t("theme.dark")
                : t("theme.light"),
          },
        )}
      </p>
    </section>
  );
}
