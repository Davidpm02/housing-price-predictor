import { useUI } from "../lib/ui";

export default function HeaderControls() {
  const { lang, setLang, theme, toggleTheme } = useUI();

  return (
    <div className="header-controls">
      <div className="lang-switch" role="group" aria-label="Language / Idioma">
        <button
          type="button"
          className={`lang-btn ${lang === "en" ? "active" : ""}`}
          onClick={() => setLang("en")}
          aria-pressed={lang === "en"}
        >
          EN
        </button>
        <button
          type="button"
          className={`lang-btn ${lang === "es" ? "active" : ""}`}
          onClick={() => setLang("es")}
          aria-pressed={lang === "es"}
        >
          ES
        </button>
      </div>
      <button
        type="button"
        className={`theme-toggle ${theme === "dark" ? "dark" : ""}`}
        onClick={toggleTheme}
        aria-label={theme === "dark" ? "Light mode" : "Dark mode"}
        title={theme === "dark" ? "Light mode" : "Dark mode"}
      >
        {theme === "dark" ? "☀️" : "🌙"}
      </button>
    </div>
  );
}