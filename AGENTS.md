# AGENTS.md

## Cursor Cloud specific instructions

### Overview

This is the "世界之窗" (World Window) news card generator — a Python-only prototype with **zero external dependencies** (stdlib only). It fetches daily news from Google News RSS (falls back to built-in sample data when offline), combines them into AI image prompt cards, and supports favorites via JSON file storage.

### Running the application

- **Web server**: `PYTHONPATH=src python3 -m world_window.server --port 8000` — serves REST API + static web UI on the specified port. Open `http://localhost:8000` in a browser.
- **CLI**: `PYTHONPATH=src python3 -m world_window.cli daily --limit 5` — prints news cards to terminal. See `README.md` for all CLI subcommands (`daily`, `more`, `favorites`).

### Key caveats

- `PYTHONPATH=src` is **required** for all commands — the `world_window` package lives under `src/`.
- The app gracefully falls back to sample data when Google News RSS is unreachable (no network access won't break it).
- Favorites are stored in `world_window_favorites.json` in the working directory; this file is created on first save.
- No `requirements.txt`, `pyproject.toml`, or external dependencies exist — nothing to install.
- No automated tests exist in the repository.
- Lint checking can be done with `python3 -m py_compile src/world_window/<module>.py` for each module.
