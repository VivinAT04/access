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


function systemTheme(): ResolvedTheme {
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


function storedTheme(): ThemePreference {
  if (
    typeof window === "undefined"
  ) {
    return "system";
  }

  const value =
    window.localStorage.getItem(
      STORAGE_KEY,
    );

  if (
    value === "light" ||
    value === "dark" ||
    value === "system"
  ) {
    return value;
  }

  return "system";
}


function resolveTheme(
  preference: ThemePreference,
): ResolvedTheme {
  if (preference === "system") {
    return systemTheme();
  }

  return preference;
}


function applyTheme(
  preference: ThemePreference,
) {
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
}


export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [theme, setThemeState] =
    useState<ThemePreference>(
      storedTheme,
    );

  const [
    resolvedTheme,
    setResolvedTheme,
  ] = useState<ResolvedTheme>(
    () => resolveTheme(
      storedTheme(),
    ),
  );


  const setTheme = useCallback(
    (
      preference:
        ThemePreference,
    ) => {
      setThemeState(
        preference,
      );

      setResolvedTheme(
        resolveTheme(
          preference,
        ),
      );

      applyTheme(
        preference,
      );
    },
    [],
  );


  useEffect(() => {
    applyTheme(theme);
  }, [theme]);


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
        systemTheme();

      setResolvedTheme(
        resolved,
      );

      document.documentElement
        .dataset.theme =
        resolved;

      document.documentElement
        .style.colorScheme =
        resolved;
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
