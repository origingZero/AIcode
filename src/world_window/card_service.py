"""Combine news and generated images into dynamic cards."""
from __future__ import annotations

import uuid
from dataclasses import dataclass
from typing import List

from .image_generator import ImageGenerator
from .news_fetcher import NewsFetcher, NewsItem


@dataclass
class Card:
    id: str
    title: str
    summary: str
    link: str
    published: str
    image_prompt: str
    image_palette: str
    image_seed: int
    image_url: str


class CardService:
    """Create interactive cards for the app."""

    def __init__(self, news_fetcher: NewsFetcher | None = None, image_generator: ImageGenerator | None = None) -> None:
        self.news_fetcher = news_fetcher or NewsFetcher()
        self.image_generator = image_generator or ImageGenerator()

    def daily_cards(self, limit: int = 5) -> List[Card]:
        stories = self.news_fetcher.fetch(limit=limit)
        return [self._build_card(story) for story in stories]

    def more_cards(self, offset: int = 5, batch: int = 5) -> List[Card]:
        stories = self.news_fetcher.fetch(limit=offset + batch)[offset:offset + batch]
        if not stories:
            return []
        return [self._build_card(story) for story in stories]

    def _build_card(self, story: NewsItem) -> Card:
        image = self.image_generator.generate_for_story(story)
        return Card(
            id=str(uuid.uuid4()),
            title=story.title,
            summary=story.summary,
            link=story.link,
            published=story.published,
            image_prompt=image.prompt,
            image_palette=image.palette,
            image_seed=image.seed,
            image_url=image.image_url,
        )
