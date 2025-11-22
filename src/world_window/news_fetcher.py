"""Fetch news stories from RSS feeds or fallback samples."""
from __future__ import annotations

import datetime as _dt
import logging
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from dataclasses import dataclass
from typing import Iterable, List, Optional

logger = logging.getLogger(__name__)


@dataclass
class NewsItem:
    title: str
    link: str
    published: str
    summary: str


class NewsFetcher:
    """Retrieve latest news items from a feed.

    The fetcher is network-friendly and falls back to curated demo data when
    the feed cannot be reached, so the rest of the app keeps functioning in
    offline environments.
    """

    def __init__(self, feed_url: str = "https://news.google.com/rss?hl=zh-CN&gl=CN&ceid=CN:zh-Hans") -> None:
        self.feed_url = feed_url

    def fetch(self, limit: int = 5) -> List[NewsItem]:
        """Return up to ``limit`` news items from the configured feed.

        Network errors are logged and the method returns sample stories to keep
        the UX consistent even when online sources are unreachable.
        """

        try:
            response = urllib.request.urlopen(self.feed_url, timeout=5)
            data = response.read()
            return list(self._parse_feed(data))[:limit]
        except (urllib.error.URLError, TimeoutError, ET.ParseError) as exc:  # pragma: no cover - network dependent
            logger.warning("Falling back to sample news due to error: %s", exc)
            return self._sample_news()[:limit]

    def _parse_feed(self, xml_bytes: bytes) -> Iterable[NewsItem]:
        root = ET.fromstring(xml_bytes)
        for item in root.iterfind("channel/item"):
            yield NewsItem(
                title=self._text(item.find("title")),
                link=self._text(item.find("link")),
                published=self._normalize_date(self._text(item.find("pubDate"))),
                summary=self._text(item.find("description")),
            )

    def _normalize_date(self, value: str) -> str:
        if not value:
            return ""
        try:
            parsed = _dt.datetime.strptime(value, "%a, %d %b %Y %H:%M:%S %Z")
            return parsed.isoformat()
        except ValueError:
            return value

    def _sample_news(self) -> List[NewsItem]:
        now = _dt.datetime.utcnow().date()
        return [
            NewsItem(
                title="AI 生成新闻卡片新体验",
                link="https://example.com/ai-cards",
                published=f"{now.isoformat()}",
                summary="移动端小程序用 AI 把每日热点融合成视觉卡片，用户可以滑动浏览。",
            ),
            NewsItem(
                title="5G 部署带来新交互",
                link="https://example.com/5g",
                published=f"{now.isoformat()}",
                summary="高速网络让实时卡片刷新成为可能，更多用户沉浸式获取资讯。",
            ),
            NewsItem(
                title="可收藏的热点卡片",
                link="https://example.com/save",
                published=f"{now.isoformat()}",
                summary="用户将喜欢的新闻卡片保存到收藏夹，随时回顾事件。",
            ),
            NewsItem(
                title="滑动解锁更多话题",
                link="https://example.com/swipe",
                published=f"{now.isoformat()}",
                summary="滑到第六张卡片即可获取更多热点，保持每日信息流。",
            ),
            NewsItem(
                title="AI 绘图与新闻结合",
                link="https://example.com/visual",
                published=f"{now.isoformat()}",
                summary="多条新闻事件融合成一张图片，用视觉化方式呈现信息。",
            ),
        ]

    @staticmethod
    def _text(node: Optional[ET.Element]) -> str:
        return node.text.strip() if node is not None and node.text else ""
