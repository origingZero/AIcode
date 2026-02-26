"""Tests for server module API handlers."""
from __future__ import annotations

import json
import tempfile
import unittest
from io import BytesIO
from pathlib import Path
from unittest.mock import patch

from world_window.server import WorldWindowHandler, build_parser


def _extract_json(wfile: BytesIO):
    """Extract JSON body from raw HTTP response bytes."""
    wfile.seek(0)
    raw = wfile.read()
    parts = raw.split(b"\r\n\r\n", 1)
    body = parts[1] if len(parts) > 1 else parts[0]
    return json.loads(body)


def _make_handler(path: str, method: str = "GET", body: bytes = b"",
                  store_path: str | None = None) -> WorldWindowHandler:
    rfile = BytesIO(body)
    wfile = BytesIO()

    handler = WorldWindowHandler.__new__(WorldWindowHandler)
    handler.request = None
    handler.client_address = ("127.0.0.1", 0)
    handler.server = type("S", (), {"server_address": ("", 8000)})()
    handler.command = method
    handler.path = path
    handler.requestline = f"{method} {path} HTTP/1.1"
    handler.request_version = "HTTP/1.1"
    handler.headers = {"Content-Length": str(len(body)), "Content-Type": "application/json"}
    handler.rfile = rfile
    handler.wfile = wfile
    handler.close_connection = True
    handler._headers_buffer = []

    from world_window.card_service import CardService
    from world_window.storage import CardStorage
    handler.card_service = CardService()

    if store_path:
        handler.storage = CardStorage(path=Path(store_path))
    else:
        tmp = tempfile.NamedTemporaryFile(suffix=".json", delete=False)
        tmp.close()
        Path(tmp.name).unlink(missing_ok=True)
        handler.storage = CardStorage(path=Path(tmp.name))

    return handler


class TestServerAPIs(unittest.TestCase):

    def test_handle_daily(self):
        handler = _make_handler("/api/daily?limit=2")
        handler._handle_daily()
        data = _extract_json(handler.wfile)
        self.assertEqual(len(data), 2)
        self.assertIn("title", data[0])
        self.assertIn("image_url", data[0])

    def test_handle_more(self):
        handler = _make_handler("/api/more?offset=0&batch=2")
        handler._handle_more()
        data = _extract_json(handler.wfile)
        self.assertEqual(len(data), 2)

    def test_handle_favorites_lifecycle(self):
        tmp = tempfile.NamedTemporaryFile(suffix=".json", delete=False)
        tmp.close()
        store = tmp.name
        Path(store).unlink(missing_ok=True)

        # GET empty
        h1 = _make_handler("/api/favorites", store_path=store)
        h1._handle_favorites_get()
        self.assertEqual(_extract_json(h1.wfile), [])

        # POST card
        card_payload = json.dumps({"card": {
            "id": "t1", "title": "T", "summary": "S", "link": "L",
            "published": "P", "image_prompt": "IP", "image_palette": "#F",
            "image_seed": 1, "image_url": "http://img"
        }}).encode()
        h2 = _make_handler("/api/favorites", method="POST", body=card_payload, store_path=store)
        h2.rfile = BytesIO(card_payload)
        h2._handle_favorites_post()
        self.assertEqual(_extract_json(h2.wfile)["status"], "saved")

        # GET with 1 card
        h3 = _make_handler("/api/favorites", store_path=store)
        h3._handle_favorites_get()
        favs = _extract_json(h3.wfile)
        self.assertEqual(len(favs), 1)
        self.assertEqual(favs[0]["id"], "t1")

        # DELETE
        del_payload = json.dumps({"id": "t1"}).encode()
        h4 = _make_handler("/api/favorites", method="DELETE", body=del_payload, store_path=store)
        h4.rfile = BytesIO(del_payload)
        h4._handle_favorites_delete()
        self.assertEqual(_extract_json(h4.wfile)["status"], "deleted")

        # GET empty again
        h5 = _make_handler("/api/favorites", store_path=store)
        h5._handle_favorites_get()
        self.assertEqual(_extract_json(h5.wfile), [])

        Path(store).unlink(missing_ok=True)

    def test_handle_favorites_post_invalid(self):
        handler = _make_handler("/api/favorites", method="POST", body=b"{}")
        handler.rfile = BytesIO(b"{}")
        handler._handle_favorites_post()
        resp = _extract_json(handler.wfile)
        self.assertIn("error", resp)

    def test_handle_favorites_delete_missing_id(self):
        handler = _make_handler("/api/favorites", method="DELETE", body=b"{}")
        handler.rfile = BytesIO(b"{}")
        handler._handle_favorites_delete()
        resp = _extract_json(handler.wfile)
        self.assertIn("error", resp)

    def test_build_parser(self):
        parser = build_parser()
        args = parser.parse_args(["--port", "9000", "--host", "127.0.0.1"])
        self.assertEqual(args.port, 9000)
        self.assertEqual(args.host, "127.0.0.1")


if __name__ == "__main__":
    unittest.main()
