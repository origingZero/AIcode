# AGENTS.md

## Cursor Cloud specific instructions

### Overview

This is the "世界之窗" (World Window) news card generator. It consists of:

- **Python backend** (`src/world_window/`) — zero external dependencies (stdlib only). Fetches daily news from Google News RSS (falls back to built-in sample data when offline), combines them into AI image prompt cards, and supports favorites via JSON file storage.
- **React+TypeScript frontend** (`frontend/`) — built with Vite, modular React components, CSS Modules, and i18n (Chinese/English).

### Running the application

1. **Start Python backend**: `PYTHONPATH=src python3 -m world_window.server --port 8000`
2. **Start React frontend**: `cd frontend && npx vite --port 5173` — proxies `/api/*` to backend on port 8000.
3. Open `http://localhost:5173` in a browser.

Alternatively, the Python server also serves the legacy static UI at `http://localhost:8000`.

- **CLI**: `PYTHONPATH=src python3 -m world_window.cli daily --limit 5` — see `README.md` for subcommands.

### Key caveats

- `PYTHONPATH=src` is **required** for all Python commands — the `world_window` package lives under `src/`.
- The app gracefully falls back to sample data when Google News RSS is unreachable.
- Favorites are stored in `world_window_favorites.json` in the working directory.
- The Python backend has zero external dependencies — nothing to install.
- The React frontend uses `npm install` in `frontend/` for dependencies.
- TypeScript checking: `cd frontend && npx tsc --noEmit`
- Production build: `cd frontend && npx vite build`
- No automated tests exist in the repository.
