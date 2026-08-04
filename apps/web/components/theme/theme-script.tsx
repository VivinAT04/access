import Script from "next/script";


const themeCode = `
(function () {
  try {
    var stored =
      window.localStorage.getItem(
        "aksess-theme"
      );

    var preference =
      stored === "light" ||
      stored === "dark" ||
      stored === "system"
        ? stored
        : "system";

    var systemDark =
      window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;

    var resolved =
      preference === "system"
        ? (
            systemDark
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

    document.documentElement
      .style.colorScheme =
      "light";
  }
})();
`;


export function ThemeScript() {
  return (
    <Script
      id="aksess-theme-script"
      strategy="beforeInteractive"
    >
      {themeCode}
    </Script>
  );
}
