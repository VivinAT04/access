"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getDirection,
} from "@/components/language/language-options";

import type {
  LanguagePreference,
} from "@/lib/types";


interface LanguageContextValue {
  preference:
    LanguagePreference | null;

  setPreference: (
    preference:
      LanguagePreference,
  ) => void;

  formatDate: (
    value:
      string | Date,
    options?:
      Intl.DateTimeFormatOptions,
  ) => string;

  formatNumber: (
    value: number,
    options?:
      Intl.NumberFormatOptions,
  ) => string;
}


const LanguageContext =
  createContext<
    LanguageContextValue | undefined
  >(undefined);


function applyLanguagePreference(
  preference:
    LanguagePreference,
) {
  const root =
    document.documentElement;

  const resolvedDirection =
    preference.direction === "auto"
      ? getDirection(
          preference.locale,
        )
      : preference.direction;

  root.lang = preference.locale;
  root.dir = resolvedDirection;

  root.dataset.locale =
    preference.locale;

  root.dataset.letterSpacing =
    preference.letter_spacing;

  root.dataset.dyslexiaFriendly =
    String(
      preference.dyslexia_friendly,
    );

  root.dataset.readingGuide =
    String(
      preference.reading_guide,
    );
}


export function LanguageProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [
    preference,
    setPreferenceState,
  ] = useState<
    LanguagePreference | null
  >(null);


  const setPreference =
    useCallback(
      (
        nextPreference:
          LanguagePreference,
      ) => {
        setPreferenceState(
          nextPreference,
        );

        applyLanguagePreference(
          nextPreference,
        );
      },
      [],
    );


  useEffect(() => {
    const timeoutId =
      window.setTimeout(
        async () => {
          try {
            const response =
              await fetch(
                "/api/language-preferences",
                {
                  cache:
                    "no-store",
                },
              );

            if (!response.ok) {
              return;
            }

            const data: LanguagePreference =
              await response.json();

            setPreference(data);
          } catch {
            // English remains the fallback.
          }
        },
        0,
      );

    return () => {
      window.clearTimeout(
        timeoutId,
      );
    };
  }, [setPreference]);


  const locale =
    preference?.locale
    ?? "en-GB";


  function formatDate(
    value:
      string | Date,
    options:
      Intl.DateTimeFormatOptions = {
        dateStyle: "medium",
      },
  ): string {
    return new Intl.DateTimeFormat(
      locale,
      options,
    ).format(
      value instanceof Date
        ? value
        : new Date(value),
    );
  }


  function formatNumber(
    value: number,
    options?:
      Intl.NumberFormatOptions,
  ): string {
    return new Intl.NumberFormat(
      locale,
      options,
    ).format(value);
  }


  return (
    <LanguageContext.Provider
      value={{
        preference,
        setPreference,
        formatDate,
        formatNumber,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}


export function useLanguage() {
  const context =
    useContext(
      LanguageContext,
    );

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider.",
    );
  }

  return context;
}
