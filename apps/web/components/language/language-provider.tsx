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
  getDictionary,
  type TranslationKey,
} from "@/components/i18n/translations";

import {
  getDirection,
} from "@/components/language/language-options";

import type {
  LanguagePreference,
} from "@/lib/types";


const STORAGE_KEY =
  "aksess-language-preference";


interface LanguageContextValue {
  preference:
    LanguagePreference | null;

  locale: string;

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

  t: (
    key: TranslationKey,
    values?: Record<
      string,
      string | number
    >,
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

  root.lang =
    preference.locale;

  root.dir =
    resolvedDirection;

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


function readCachedPreference():
  LanguagePreference | null {
  if (
    typeof window
    === "undefined"
  ) {
    return null;
  }

  const stored =
    window.localStorage.getItem(
      STORAGE_KEY,
    );

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(
      stored,
    ) as LanguagePreference;
  } catch {
    return null;
  }
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

        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(
            nextPreference,
          ),
        );
      },
      [],
    );


  useEffect(() => {
    const timeoutId =
      window.setTimeout(
        async () => {
          const cached =
            readCachedPreference();

          if (cached) {
            setPreference(cached);
          }

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

            const data:
              LanguagePreference =
                await response.json();

            setPreference(data);
          } catch {
            // Cached preference or English remains active.
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


  function t(
    key: TranslationKey,
    values: Record<
      string,
      string | number
    > = {},
  ): string {
    const dictionary =
      getDictionary(locale);

    let result =
      dictionary[key] ?? key;

    for (
      const [
        placeholder,
        value,
      ]
      of Object.entries(values)
    ) {
      result =
        result.replaceAll(
          `{${placeholder}}`,
          String(value),
        );
    }

    return result;
  }


  return (
    <LanguageContext.Provider
      value={{
        preference,
        locale,
        setPreference,
        formatDate,
        formatNumber,
        t,
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
