"""Lightweight AI image prompt composer for news cards."""
from __future__ import annotations

import hashlib
from dataclasses import dataclass
from typing import Iterable, List

from .news_fetcher import NewsItem


@dataclass
class GeneratedImage:
    """Representation of an AI-generated image request/response."""

    prompt: str
    palette: str
    seed: int


class ImageGenerator:
    """Generate textual prompts and metadata for image synthesis.

    The class does not call an AI API directly (keep secrets and billing out of
    the repository) but prepares all necessary prompts so downstream clients or
    cloud functions can render the images.
    """

    def build_prompt(self, stories: Iterable[NewsItem]) -> str:
        summaries = [self._compact_story(story) for story in stories]
        return "融合报道: " + " | ".join(summaries)

    def generate(self, stories: List[NewsItem]) -> GeneratedImage:
        prompt = self.build_prompt(stories)
        seed = self._stable_seed(prompt)
        palette = self._palette_from_seed(seed)
        return GeneratedImage(prompt=prompt, palette=palette, seed=seed)

    def _compact_story(self, story: NewsItem) -> str:
        return f"{story.title} - {story.summary[:60]}" if story.summary else story.title

    def _stable_seed(self, text: str) -> int:
        digest = hashlib.sha256(text.encode("utf-8")).digest()
        return int.from_bytes(digest[:4], "big")

    def _palette_from_seed(self, seed: int) -> str:
        colors = ["#007AFF", "#FF2D55", "#FFCC00", "#34C759", "#5856D6", "#FF9500"]
        return colors[seed % len(colors)]
