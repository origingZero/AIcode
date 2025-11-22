"""Minimal HTTP server exposing card APIs and a demo UI."""
from __future__ import annotations

import argparse
import json
import os
import urllib.parse
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Dict, List

from .card_service import Card, CardService
from .storage import CardStorage

REPO_ROOT = Path(__file__).resolve().parents[2]
STATIC_DIR = REPO_ROOT / "web"
DEFAULT_STORE = Path(os.environ.get("WORLD_WINDOW_STORE", "world_window_favorites.json"))


def _card_to_dict(card) -> Dict[str, object]:
    return {
        "id": card.id,
        "title": card.title,
        "summary": card.summary,
        "link": card.link,
        "published": card.published,
        "image_prompt": card.image_prompt,
        "image_palette": card.image_palette,
        "image_seed": card.image_seed,
    }


class WorldWindowHandler(SimpleHTTPRequestHandler):
    """Serve the demo UI and provide JSON APIs for cards and favorites."""

    def __init__(self, *args, directory: str | None = None, **kwargs) -> None:
        self.card_service = CardService()
        self.storage = CardStorage(path=DEFAULT_STORE)
        super().__init__(*args, directory=str(STATIC_DIR), **kwargs)

    def _send_json(self, payload: object, status: HTTPStatus = HTTPStatus.OK) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _parse_query(self) -> Dict[str, List[str]]:
        parsed = urllib.parse.urlparse(self.path)
        return urllib.parse.parse_qs(parsed.query)

    def _handle_daily(self) -> None:
        params = self._parse_query()
        limit = int(params.get("limit", ["5"])[0])
        cards = self.card_service.daily_cards(limit=limit)
        self._send_json([_card_to_dict(card) for card in cards])

    def _handle_more(self) -> None:
        params = self._parse_query()
        offset = int(params.get("offset", ["5"])[0])
        batch = int(params.get("batch", ["5"])[0])
        cards = self.card_service.more_cards(offset=offset, batch=batch)
        self._send_json([_card_to_dict(card) for card in cards])

    def _handle_favorites_get(self) -> None:
        cards = self.storage.load()
        self._send_json([_card_to_dict(card) for card in cards])

    def _handle_favorites_post(self) -> None:
        length = int(self.headers.get("Content-Length", 0))
        raw = self.rfile.read(length)
        try:
            payload = json.loads(raw or b"{}")
            card_data = payload.get("card")
            if not card_data:
                raise ValueError("Missing card payload")
            card = Card(**card_data)
            self.storage.append(card)
        except Exception:  # pragma: no cover - defensive, demo-only
            self._send_json({"error": "Invalid payload"}, status=HTTPStatus.BAD_REQUEST)
            return
        self._send_json({"status": "saved"})

    def _handle_favorites_delete(self) -> None:
        length = int(self.headers.get("Content-Length", 0))
        raw = self.rfile.read(length)
        payload = json.loads(raw or b"{}")
        card_id = payload.get("id")
        if not card_id:
            self._send_json({"error": "Missing id"}, status=HTTPStatus.BAD_REQUEST)
            return
        self.storage.delete(card_id)
        self._send_json({"status": "deleted"})

    def do_GET(self) -> None:  # noqa: N802 - inherited naming
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/daily":
            return self._handle_daily()
        if parsed.path == "/api/more":
            return self._handle_more()
        if parsed.path == "/api/favorites":
            return self._handle_favorites_get()
        return super().do_GET()

    def do_POST(self) -> None:  # noqa: N802 - inherited naming
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/favorites":
            return self._handle_favorites_post()
        return self._send_json({"error": "Unsupported path"}, status=HTTPStatus.NOT_FOUND)

    def do_DELETE(self) -> None:  # noqa: N802 - inherited naming
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/favorites":
            return self._handle_favorites_delete()
        return self._send_json({"error": "Unsupported path"}, status=HTTPStatus.NOT_FOUND)

    def log_message(self, format: str, *args) -> None:  # pragma: no cover - noise reduction
        # Keep server output concise for the demo.
        return


def run_server(host: str = "0.0.0.0", port: int = 8000, store: Path = DEFAULT_STORE) -> None:
    global DEFAULT_STORE
    DEFAULT_STORE = store
    handler = lambda *args, **kwargs: WorldWindowHandler(*args, **kwargs)  # noqa: E731 - factory
    server = ThreadingHTTPServer((host, port), handler)
    print(f"Serving world window UI on http://{host}:{port} (static: {STATIC_DIR})")
    print("API endpoints: /api/daily, /api/more, /api/favorites")
    try:
        server.serve_forever()
    except KeyboardInterrupt:  # pragma: no cover - manual stop
        pass


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="世界之窗演示 Web 服务")
    parser.add_argument("--host", default="0.0.0.0", help="监听地址，默认 0.0.0.0")
    parser.add_argument("--port", type=int, default=8000, help="端口，默认 8000")
    parser.add_argument(
        "--store",
        type=Path,
        default=DEFAULT_STORE,
        help="收藏存储文件路径（用于 favorites 接口）",
    )
    return parser


def main(argv=None) -> None:
    parser = build_parser()
    args = parser.parse_args(argv)
    global DEFAULT_STORE
    DEFAULT_STORE = args.store
    run_server(host=args.host, port=args.port, store=args.store)


if __name__ == "__main__":
    main()
