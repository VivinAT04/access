"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import type {
  AccessibilityPreferences,
  AccessibilityPreferenceUpdate,
} from "@/lib/types";


interface AccessibilityContextValue {
  preferences: AccessibilityPreferenceUpdate;
  isLoading: boolean;
  updatePreferences: (
    values: AccessibilityPreferenceUpdate,
  ) => Promise<boolean>;
}


const defaultPreferences: AccessibilityPreferenceUpdate = {
  font_size: "medium",
  high_contrast: false,
  reduced_motion: false,
  dyslexia_friendly_font: false,
  increased_spacing: false,
  simplified_interface: false,
  screen_reader_optimised: false,
};


const AccessibilityContext =
  createContext<AccessibilityContextValue | null>(null);


function readStoredPreferences(): AccessibilityPreferenceUpdate {
  if (typeof window === "undefined") {
    return defaultPreferences;
  }

  const storedPreferences = window.localStorage.getItem(
    "aksess-accessibility",
  );

  if (!storedPreferences) {
    return defaultPreferences;
  }

  try {
    return JSON.parse(
      storedPreferences,
    ) as AccessibilityPreferenceUpdate;
  } catch {
    window.localStorage.removeItem(
      "aksess-accessibility",
    );

    return defaultPreferences;
  }
}


function applyPreferences(
  preferences: AccessibilityPreferenceUpdate,
) {
  const root = document.documentElement;

  root.dataset.fontSize = preferences.font_size;

  root.classList.toggle(
    "accessibility-high-contrast",
    preferences.high_contrast,
  );

  root.classList.toggle(
    "accessibility-reduced-motion",
    preferences.reduced_motion,
  );

  root.classList.toggle(
    "accessibility-dyslexia-font",
    preferences.dyslexia_friendly_font,
  );

  root.classList.toggle(
    "accessibility-increased-spacing",
    preferences.increased_spacing,
  );

  root.classList.toggle(
    "accessibility-simplified",
    preferences.simplified_interface,
  );

  root.classList.toggle(
    "accessibility-screen-reader",
    preferences.screen_reader_optimised,
  );

  window.localStorage.setItem(
    "aksess-accessibility",
    JSON.stringify(preferences),
  );
}


function extractPreferences(
  data: AccessibilityPreferences,
): AccessibilityPreferenceUpdate {
  return {
    font_size: data.font_size,
    high_contrast: data.high_contrast,
    reduced_motion: data.reduced_motion,
    dyslexia_friendly_font:
      data.dyslexia_friendly_font,
    increased_spacing: data.increased_spacing,
    simplified_interface:
      data.simplified_interface,
    screen_reader_optimised:
      data.screen_reader_optimised,
  };
}


export function AccessibilityProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [preferences, setPreferences] =
    useState<AccessibilityPreferenceUpdate>(
      readStoredPreferences,
    );

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    applyPreferences(preferences);
  }, [preferences]);

  useEffect(() => {
    async function loadPreferences() {
      try {
        const response = await fetch(
          "/api/accessibility/preferences",
          {
            cache: "no-store",
          },
        );

        if (!response.ok) {
          return;
        }

        const data =
          (await response.json()) as AccessibilityPreferences;

        setPreferences(extractPreferences(data));
      } finally {
        setIsLoading(false);
      }
    }

    void loadPreferences();
  }, []);

  const updatePreferences = useCallback(
    async (
      values: AccessibilityPreferenceUpdate,
    ): Promise<boolean> => {
      setPreferences(values);

      try {
        const response = await fetch(
          "/api/accessibility/preferences",
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(values),
          },
        );

        if (!response.ok) {
          return false;
        }

        const data =
          (await response.json()) as AccessibilityPreferences;

        setPreferences(extractPreferences(data));

        return true;
      } catch {
        return false;
      }
    },
    [],
  );

  return (
    <AccessibilityContext.Provider
      value={{
        preferences,
        isLoading,
        updatePreferences,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}


export function useAccessibility() {
  const context = useContext(AccessibilityContext);

  if (!context) {
    throw new Error(
      "useAccessibility must be used inside AccessibilityProvider.",
    );
  }

  return context;
}
