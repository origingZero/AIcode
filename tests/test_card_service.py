"""Tests for card_service module."""
from __future__ import annotations

import unittest
from unittest.mock import MagicMock

from world_window.card_service import Card, CardService
from world_window.news_fetcher import NewsItem


def _make_story(title: str = "Test", link: str = "https://example.com") -> NewsItem:
    return NewsItem(title=title, link=link, published="2025-01-01", summary="Summary text")


class TestCardService(unittest.TestCase):

    def test_stable_id_deterministic(self):
        story = _make_story(title="Hello", link="https://a.com")
        id1 = CardService._stable_id(story)
        id2 = CardService._stable_id(story)
        self.assertEqual(id1, id2)
        self.assertEqual(len(id1), 16)

    def test_stable_id_different_for_different_stories(self):
        s1 = _make_story(title="A", link="https://a.com")
        s2 = _make_story(title="B", link="https://b.com")
        self.assertNotEqual(CardService._stable_id(s1), CardService._stable_id(s2))

    def test_daily_cards_returns_correct_count(self):
        mock_fetcher = MagicMock()
        mock_fetcher.fetch.return_value = [_make_story(title=f"N{i}") for i in range(3)]
        service = CardService(news_fetcher=mock_fetcher)
        cards = service.daily_cards(limit=3)
        self.assertEqual(len(cards), 3)
        mock_fetcher.fetch.assert_called_once_with(limit=3)

    def test_daily_cards_returns_card_instances(self):
        mock_fetcher = MagicMock()
        mock_fetcher.fetch.return_value = [_make_story()]
        service = CardService(news_fetcher=mock_fetcher)
        cards = service.daily_cards(limit=1)
        self.assertIsInstance(cards[0], Card)

    def test_card_fields_match_story(self):
        story = _make_story(title="Headline", link="https://news.com/1")
        mock_fetcher = MagicMock()
        mock_fetcher.fetch.return_value = [story]
        service = CardService(news_fetcher=mock_fetcher)
        card = service.daily_cards(limit=1)[0]
        self.assertEqual(card.title, "Headline")
        self.assertEqual(card.link, "https://news.com/1")
        self.assertEqual(card.summary, "Summary text")
        self.assertTrue(card.image_prompt)
        self.assertTrue(card.image_url)

    def test_card_id_is_stable_across_calls(self):
        story = _make_story(title="Same", link="https://same.com")
        mock_fetcher = MagicMock()
        mock_fetcher.fetch.return_value = [story]
        service = CardService(news_fetcher=mock_fetcher)
        c1 = service.daily_cards(limit=1)[0]
        c2 = service.daily_cards(limit=1)[0]
        self.assertEqual(c1.id, c2.id)

    def test_each_card_has_unique_prompt(self):
        stories = [_make_story(title="Alpha"), _make_story(title="Beta")]
        mock_fetcher = MagicMock()
        mock_fetcher.fetch.return_value = stories
        service = CardService(news_fetcher=mock_fetcher)
        cards = service.daily_cards(limit=2)
        self.assertNotEqual(cards[0].image_prompt, cards[1].image_prompt)
        self.assertIn("Alpha", cards[0].image_prompt)
        self.assertIn("Beta", cards[1].image_prompt)

    def test_more_cards_with_offset(self):
        stories = [_make_story(title=f"S{i}") for i in range(8)]
        mock_fetcher = MagicMock()
        mock_fetcher.fetch.return_value = stories
        service = CardService(news_fetcher=mock_fetcher)
        cards = service.more_cards(offset=5, batch=3)
        self.assertEqual(len(cards), 3)
        self.assertEqual(cards[0].title, "S5")

    def test_more_cards_empty_when_offset_exceeds(self):
        mock_fetcher = MagicMock()
        mock_fetcher.fetch.return_value = [_make_story()]
        service = CardService(news_fetcher=mock_fetcher)
        cards = service.more_cards(offset=10, batch=5)
        self.assertEqual(cards, [])


if __name__ == "__main__":
    unittest.main()
