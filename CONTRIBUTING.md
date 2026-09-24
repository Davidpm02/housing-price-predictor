# Contributing guide to HomeValue - Housing Price Estimation in Spain

First of all, thank you for your interest in contributing. Projects like this improve because of people like you.

To keep the project organized, maintainable, and scalable, please follow these guidelines before submitting code or reporting issues.

---

## 1. Reporting bugs or suggesting features

Before opening a new *Issue*, please:

1. Check the **Issues** tab to ensure the bug or suggestion has not already been reported.
2. If it is a new issue, open an *Issue* including:

   * Your operating system and Python version
   * Exact steps to reproduce the problem
   * Expected behavior vs. actual behavior
   * Screenshots, if the issue is UI-related


## 2. Development environment setup

Setting up the development environment is intentionally simple thanks to the automated orchestration script.

1. **Fork** this repository to your GitHub account.

2. **Clone** your fork locally:

   ```bash
   git clone https://github.com/Davidpm02/housing-price-predictor.git
   cd housing-price-predictor
   ```

3. Create a descriptive branch for your changes:

   ```bash
   git checkout -b feature/your-feature-name
   # or for bug fixes:
   git checkout -b fix/bug-description
   ```

4. Run the application:

   No manual virtual environment setup is required. Simply execute:

   ```bash
   python3 run.py
   ```

   This script will:

   * Create an isolated `.venv`
   * Install all required dependencies
   * Start the application automatically


## 3. Code and design standards

To maintain a professional and cohesive codebase, please follow these standards:

### Backend (Python / FastAPI)

* Follow **PEP 8** for code readability
* Ensure complex functions include:

  * Clear docstrings
  * Proper type hints
* If you add a new dependency, update:

  ```
  app/requirements.txt
  ```

### Frontend (React / Vite)

Stack is **React 18 + Vite 5 + TypeScript** (`client/`). The build outputs to `../app/static` (`client/vite.config.ts:8`) and is served by FastAPI; `vite dev` proxies `/api` to `127.0.0.1:8000` (`client/vite.config.ts:14`).

* **Components:** functional components + hooks only, with strict TypeScript. Keep the existing structure — `client/src/components/` (Header, ValuationForm, SpainMap, PropertyPanel/Filters/DetailModal, `dashboard/`), `client/src/lib/` (`api.ts`, `dashboardApi.ts`, `ui.tsx`, `geo.ts`), single design file `client/src/styles.css`. Do not introduce CSS frameworks or CSS modules.
* **Design system:** respect the glassmorphic identity — use CSS variables (`--bg`, `--surface`, `--surface-2`, `--ink`, `--muted`, `--border`, `--radius`, `--shadow`, `--font-display/body`) and `data-theme="dark"` (toggled in `client/src/lib/ui.tsx:54`). No hardcoded colors (`#fff`, `#000`) or inline `style` for static values; use existing classes (`.card`, `.valuation-card`, `.property-card`, `.chart-card`, `.modal-*`). Dark mode must remain legible (check both themes).
* **Charts & map:** `recharts` for dashboard charts, `leaflet`/`react-leaflet` for `SpainMap`. Reuse `houseTypeColor()` / `colorScale()` from `lib/dashboardApi.ts:124` and keep `ResponsiveContainer` patterns from `Dashboard.tsx`.
* **i18n & formatting:** never hardcode UI strings — use `useUI().t(key)` and dictionaries in `lib/ui.tsx:14`, and helpers `formatPrice`/`formatNumber`/`houseTypeLabel`.
* **Dev & build:**
  ```bash
  cd client
  npm install
  npm run dev      # http://localhost:5173 with /api proxy
  npm run build    # production build to app/static (also run by ./run.sh:24)
  ```
  Verify `npx tsc --noEmit` and the production build before opening a PR. Keep changes responsive (`clamp()`, grid) and accessible.


## 4. Submitting pull requests (PRs)

When your changes are ready:

1. Ensure the application runs cleanly with:

   ```bash
   python3 run.py
   ```

   and produces no console errors.

2. Push your changes to your fork.

3. Open a pull request targeting the `main` branch of the original repository.

4. In your PR description, clearly explain:

   * What problem this change solves
   * How the change can be tested (visually or logically)
   * Reference the related Issue if applicable (e.g., `Closes #12`)


---

Thank you for contributing. Your work is appreciated and will be reviewed as soon as possible.