"""Tests for storage module."""
from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path

from world_window.card_service import Card
from world_window.storage import CardStorage


def _make_card(card_id: str = "c1", title: str = "Test") -> Card:
    return Card(
        id=card_id, title=title, summary="s", link="https://x.com",
        published="2025-01-01", image_prompt="prompt", image_palette="#000",
        image_seed=42, image_url="https://picsum.photos/seed/42/600/340",
    )


class TestCardStorage(unittest.TestCase):

    def setUp(self):
        self.tmp = tempfile.NamedTemporaryFile(suffix=".json", delete=False)
        self.tmp.close()
        self.path = Path(self.tmp.name)
        self.path.unlink()
        self.storage = CardStorage(path=self.path)

    def tearDown(self):
        if self.path.exists():
            self.path.unlink()

    def test_load_returns_empty_when_no_file(self):
        self.assertEqual(self.storage.load(), [])

    def test_save_and_load_roundtrip(self):
        card = _make_card()
        self.storage.save([card])
        loaded = self.storage.load()
        self.assertEqual(len(loaded), 1)
        self.assertEqual(loaded[0].id, "c1")
        self.assertEqual(loaded[0].title, "Test")
        self.assertEqual(loaded[0].image_url, "https://picsum.photos/seed/42/600/340")

    def test_append(self):
        self.storage.append(_make_card(card_id="a"))
        self.storage.append(_make_card(card_id="b"))
        loaded = self.storage.load()
        self.assertEqual(len(loaded), 2)
        self.assertEqual(loaded[0].id, "a")
        self.assertEqual(loaded[1].id, "b")

    def test_delete(self):
        self.storage.save([_make_card(card_id="x"), _make_card(card_id="y")])
        self.storage.delete("x")
        loaded = self.storage.load()
        self.assertEqual(len(loaded), 1)
        self.assertEqual(loaded[0].id, "y")

    def test_delete_nonexistent_is_noop(self):
        self.storage.save([_make_card(card_id="a")])
        self.storage.delete("zzz")
        self.assertEqual(len(self.storage.load()), 1)

    def test_load_legacy_data_without_image_url(self):
        legacy = [{"id": "old", "title": "T", "summary": "S", "link": "L",
                    "published": "P", "image_prompt": "IP", "image_palette": "#FFF",
                    "image_seed": 1}]
        self.path.write_text(json.dumps(legacy), encoding="utf-8")
        loaded = self.storage.load()
        self.assertEqual(len(loaded), 1)
        self.assertEqual(loaded[0].image_url, "")

    def test_save_creates_valid_json(self):
        self.storage.save([_make_card()])
        raw = json.loads(self.path.read_text(encoding="utf-8"))
        self.assertIsInstance(raw, list)
        self.assertEqual(len(raw), 1)
        self.assertIn("id", raw[0])

    def test_concurrent_append_and_delete(self):
        for i in range(5):
            self.storage.append(_make_card(card_id=str(i)))
        self.assertEqual(len(self.storage.load()), 5)
        self.storage.delete("2")
        self.storage.delete("4")
        remaining = self.storage.load()
        self.assertEqual(len(remaining), 3)
        ids = [c.id for c in remaining]
        self.assertNotIn("2", ids)
        self.assertNotIn("4", ids)


if __name__ == "__main__":
    unittest.main()
