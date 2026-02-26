"""Tests for image_generator module."""
from __future__ import annotations

import unittest

from world_window.image_generator import ImageGenerator, GeneratedImage
from world_window.news_fetcher import NewsItem


def _make_story(title: str = "Test", summary: str = "Summary") -> NewsItem:
    return NewsItem(title=title, link="https://example.com", published="2025-01-01", summary=summary)


class TestImageGenerator(unittest.TestCase):

    def setUp(self):
        self.gen = ImageGenerator()

    def test_generate_for_story_returns_generated_image(self):
        story = _make_story()
        result = self.gen.generate_for_story(story)
        self.assertIsInstance(result, GeneratedImage)
        self.assertTrue(result.prompt)
        self.assertTrue(result.palette.startswith("#"))
        self.assertIsInstance(result.seed, int)
        self.assertIn("picsum.photos", result.image_url)

    def test_generate_for_story_prompt_contains_title(self):
        story = _make_story(title="Breaking News")
        result = self.gen.generate_for_story(story)
        self.assertIn("Breaking News", result.prompt)

    def test_generate_for_story_deterministic(self):
        story = _make_story(title="Stable", summary="Content")
        r1 = self.gen.generate_for_story(story)
        r2 = self.gen.generate_for_story(story)
        self.assertEqual(r1.seed, r2.seed)
        self.assertEqual(r1.palette, r2.palette)
        self.assertEqual(r1.image_url, r2.image_url)
        self.assertEqual(r1.prompt, r2.prompt)

    def test_different_stories_different_seeds(self):
        s1 = _make_story(title="Story A")
        s2 = _make_story(title="Story B")
        r1 = self.gen.generate_for_story(s1)
        r2 = self.gen.generate_for_story(s2)
        self.assertNotEqual(r1.seed, r2.seed)

    def test_build_prompt_multiple_stories(self):
        stories = [_make_story(title="A"), _make_story(title="B")]
        prompt = self.gen.build_prompt(stories)
        self.assertIn("融合报道", prompt)
        self.assertIn("A", prompt)
        self.assertIn("B", prompt)

    def test_generate_batch(self):
        stories = [_make_story(title="X"), _make_story(title="Y")]
        result = self.gen.generate(stories)
        self.assertIsInstance(result, GeneratedImage)
        self.assertIn("X", result.prompt)
        self.assertIn("Y", result.prompt)

    def test_compact_story_without_summary(self):
        story = _make_story(title="Title Only", summary="")
        result = self.gen._compact_story(story)
        self.assertEqual(result, "Title Only")

    def test_compact_story_truncates_long_summary(self):
        story = _make_story(summary="A" * 200)
        result = self.gen._compact_story(story)
        self.assertLessEqual(len(result.split(" - ")[1]), 60)

    def test_palette_is_valid_hex(self):
        for seed in range(20):
            palette = self.gen._palette_from_seed(seed)
            self.assertTrue(palette.startswith("#"))
            self.assertEqual(len(palette), 7)

    def test_image_url_contains_seed(self):
        url = self.gen._image_url_from_seed(12345)
        self.assertIn("12345", url)
        self.assertIn("600/340", url)


if __name__ == "__main__":
    unittest.main()
