import { useState } from "react";
import HeaderControls from "./HeaderControls";
import { isDashboardClicked, markDashboardClicked, useUI } from "../lib/ui";

export default function Header() {
  const { t } = useUI();
  const [pulse, setPulse] = useState<boolean>(() => !isDashboardClicked());

  return (
    <header className="site-header">
      <div className="container header-inner">
        <a href="#" className="brand">
          <span className="brand-mark">🏡</span>
          <span className="brand-name">
            Home<span>Value</span>
          </span>
        </a>
        <nav className="nav-links">
          <a href="#valoracion">{t("nav.valuate")}</a>
          <a href="#mapa">{t("nav.explore")}</a>
        </nav>
        <div className="header-right">
          <a
            href="/dashboard"
            className={`nav-dashboard-btn ${pulse ? "pulse" : ""}`}
            onClick={() => {
              markDashboardClicked();
              setPulse(false);
            }}
          >
            {t("nav.dashboard")}
          </a>
          <HeaderControls />
        </div>
      </div>
    </header>
  );
}