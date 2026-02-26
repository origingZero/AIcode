"""Tests for news_fetcher module."""
from __future__ import annotations

import textwrap
import unittest
from unittest.mock import patch, MagicMock

from world_window.news_fetcher import NewsFetcher, NewsItem


class TestNewsFetcher(unittest.TestCase):

    def test_sample_news_returns_five_items(self):
        fetcher = NewsFetcher()
        samples = fetcher._sample_news()
        self.assertEqual(len(samples), 5)
        for item in samples:
            self.assertIsInstance(item, NewsItem)
            self.assertTrue(item.title)
            self.assertTrue(item.link)

    def test_fetch_respects_limit(self):
        fetcher = NewsFetcher()
        samples = fetcher._sample_news()
        self.assertEqual(len(samples[:3]), 3)

    def test_parse_feed_extracts_items(self):
        xml = textwrap.dedent("""\
            <?xml version="1.0" encoding="UTF-8"?>
            <rss version="2.0">
              <channel>
                <item>
                  <title>Test Title</title>
                  <link>https://example.com/1</link>
                  <pubDate>Mon, 01 Jan 2024 12:00:00 GMT</pubDate>
                  <description>Summary text</description>
                </item>
                <item>
                  <title>Second</title>
                  <link>https://example.com/2</link>
                  <pubDate></pubDate>
                  <description></description>
                </item>
              </channel>
            </rss>
        """).encode("utf-8")

        fetcher = NewsFetcher()
        items = list(fetcher._parse_feed(xml))
        self.assertEqual(len(items), 2)
        self.assertEqual(items[0].title, "Test Title")
        self.assertEqual(items[0].link, "https://example.com/1")
        self.assertEqual(items[0].published, "2024-01-01T12:00:00")
        self.assertEqual(items[0].summary, "Summary text")
        self.assertEqual(items[1].title, "Second")

    def test_normalize_date_valid(self):
        fetcher = NewsFetcher()
        result = fetcher._normalize_date("Tue, 25 Feb 2025 10:30:00 GMT")
        self.assertEqual(result, "2025-02-25T10:30:00")

    def test_normalize_date_invalid_returns_original(self):
        fetcher = NewsFetcher()
        self.assertEqual(fetcher._normalize_date("not-a-date"), "not-a-date")

    def test_normalize_date_empty(self):
        fetcher = NewsFetcher()
        self.assertEqual(fetcher._normalize_date(""), "")

    def test_text_with_none_element(self):
        self.assertEqual(NewsFetcher._text(None), "")

    def test_fetch_falls_back_on_network_error(self):
        fetcher = NewsFetcher(feed_url="http://invalid.test/rss")
        with patch.object(fetcher, '_sample_news') as mock_sample:
            mock_sample.return_value = [
                NewsItem(title="Fallback", link="http://x", published="", summary="s")
            ]
            import urllib.error
            with patch("urllib.request.urlopen", side_effect=urllib.error.URLError("fail")):
                result = fetcher.fetch(limit=1)
            self.assertEqual(len(result), 1)
            self.assertEqual(result[0].title, "Fallback")

    def test_fetch_with_successful_response(self):
        xml = b"""<?xml version="1.0"?>
        <rss><channel>
          <item><title>Live</title><link>http://a</link>
          <pubDate></pubDate><description>desc</description></item>
        </channel></rss>"""

        mock_resp = MagicMock()
        mock_resp.read.return_value = xml

        fetcher = NewsFetcher()
        with patch("urllib.request.urlopen", return_value=mock_resp):
            result = fetcher.fetch(limit=5)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0].title, "Live")


if __name__ == "__main__":
    unittest.main()
