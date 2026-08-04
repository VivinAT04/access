"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";


export type ThemePreference =
  | "light"
  | "dark"
  | "system";

type ResolvedTheme =
  | "light"
  | "dark";


interface ThemeContextValue {
  theme: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setTheme: (
    theme: ThemePreference,
  ) => void;
}


const STORAGE_KEY =
  "aksess-theme";


const ThemeContext =
  createContext<
    ThemeContextValue | undefined
  >(undefined);


function getSystemTheme(): ResolvedTheme {
  if (
    typeof window !== "undefined" &&
    window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches
  ) {
    return "dark";
  }

  return "light";
}


function getStoredTheme(): ThemePreference {
  if (
    typeof window === "undefined"
  ) {
    return "system";
  }

  const stored =
    window.localStorage.getItem(
      STORAGE_KEY,
    );

  if (
    stored === "light" ||
    stored === "dark" ||
    stored === "system"
  ) {
    return stored;
  }

  return "system";
}


function resolveTheme(
  preference: ThemePreference,
): ResolvedTheme {
  if (
    preference === "system"
  ) {
    return getSystemTheme();
  }

  return preference;
}


function applyTheme(
  preference: ThemePreference,
): ResolvedTheme {
  const resolved =
    resolveTheme(preference);

  const root =
    document.documentElement;

  root.dataset.theme =
    resolved;

  root.dataset.themePreference =
    preference;

  root.style.colorScheme =
    resolved;

  window.localStorage.setItem(
    STORAGE_KEY,
    preference,
  );

  return resolved;
}


export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  /*
   * These values must be identical during
   * server rendering and initial client
   * hydration.
   */
  const [theme, setThemeState] =
    useState<ThemePreference>(
      "system",
    );

  const [
    resolvedTheme,
    setResolvedTheme,
  ] = useState<ResolvedTheme>(
    "light",
  );


  const setTheme = useCallback(
    (
      preference:
        ThemePreference,
    ) => {
      const resolved =
        applyTheme(
          preference,
        );

      setThemeState(
        preference,
      );

      setResolvedTheme(
        resolved,
      );
    },
    [],
  );


  /*
   * Read localStorage only after hydration.
   * The timeout callback avoids a synchronous
   * state update directly inside the effect.
   */
  useEffect(() => {
    const timeoutId =
      window.setTimeout(() => {
        const preference =
          getStoredTheme();

        const resolved =
          applyTheme(
            preference,
          );

        setThemeState(
          preference,
        );

        setResolvedTheme(
          resolved,
        );
      }, 0);

    return () => {
      window.clearTimeout(
        timeoutId,
      );
    };
  }, []);


  /*
   * Update System mode when the operating
   * system appearance changes.
   */
  useEffect(() => {
    const mediaQuery =
      window.matchMedia(
        "(prefers-color-scheme: dark)",
      );

    function handleSystemChange() {
      if (
        theme !== "system"
      ) {
        return;
      }

      const resolved =
        getSystemTheme();

      document.documentElement
        .dataset.theme =
        resolved;

      document.documentElement
        .style.colorScheme =
        resolved;

      setResolvedTheme(
        resolved,
      );
    }

    mediaQuery.addEventListener(
      "change",
      handleSystemChange,
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        handleSystemChange,
      );
    };
  }, [theme]);


  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}


export function useTheme() {
  const context =
    useContext(
      ThemeContext,
    );

  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeProvider.",
    );
  }

  return context;
}
