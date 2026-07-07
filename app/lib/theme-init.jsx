// Server component: renders the blocking theme-init script as part of the
// server HTML so the correct theme class is set before first paint (no
// flash). Must NOT be a client component — client-rendered <script> tags are
// never executed by React and trigger console errors on every render.

const THEME_KEY = "pv-theme";

const THEME_INIT_SOURCE = `
(function () {
  try {
    var stored = localStorage.getItem("${THEME_KEY}");
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var theme = stored || (prefersDark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", theme === "dark");
  } catch (e) {}
})();
`;

export function ThemeInitScript() {
  return <script id="pv-theme-init" dangerouslySetInnerHTML={{ __html: THEME_INIT_SOURCE }} />;
}
