"""Simple JSON-based storage for saved cards."""
from __future__ import annotations

import json
import os
from dataclasses import asdict
from pathlib import Path
from typing import List

from .card_service import Card


class CardStorage:
    def __init__(self, path: str | os.PathLike[str] = "world_window_favorites.json") -> None:
        self.path = Path(path)

    def save(self, cards: List[Card]) -> None:
        payload = [asdict(card) for card in cards]
        self.path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    def load(self) -> List[Card]:
        if not self.path.exists():
            return []
        raw = json.loads(self.path.read_text(encoding="utf-8"))
        cards = []
        for item in raw:
            item.setdefault("image_url", "")
            cards.append(Card(**item))
        return cards

    def append(self, card: Card) -> None:
        cards = self.load()
        cards.append(card)
        self.save(cards)

    def delete(self, card_id: str) -> None:
        cards = [card for card in self.load() if card.id != card_id]
        self.save(cards)
