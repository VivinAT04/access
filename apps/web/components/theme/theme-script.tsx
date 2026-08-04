export function ThemeScript() {
  const code = `
    (function () {
      try {
        var saved =
          localStorage.getItem(
            "aksess-theme"
          );

        var preference =
          saved === "light" ||
          saved === "dark" ||
          saved === "system"
            ? saved
            : "system";

        var resolved =
          preference === "system"
            ? (
                window.matchMedia(
                  "(prefers-color-scheme: dark)"
                ).matches
                  ? "dark"
                  : "light"
              )
            : preference;

        var root =
          document.documentElement;

        root.dataset.theme =
          resolved;

        root.dataset.themePreference =
          preference;

        root.style.colorScheme =
          resolved;
      } catch (_) {
        document.documentElement
          .dataset.theme =
          "light";
      }
    })();
  `;

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: code,
      }}
      suppressHydrationWarning
    />
  );
}
