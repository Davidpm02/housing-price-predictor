import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import Dashboard from "./components/Dashboard";
import { UIProvider } from "./lib/ui";
import "./styles.css";

function Root() {
  const isDashboard =
    window.location.pathname.startsWith("/dashboard") ||
    window.location.pathname.endsWith("/dashboard") ||
    window.location.pathname.includes("/dashboard/");
  return isDashboard ? <Dashboard /> : <App />;
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <UIProvider>
      <Root />
    </UIProvider>
  </React.StrictMode>
);