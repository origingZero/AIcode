"""Command line helper that simulates the 小程序 workflow."""
from __future__ import annotations

import argparse
from pathlib import Path
from typing import List

from .card_service import CardService
from .storage import CardStorage


def _print_cards(cards, label: str) -> None:
    print(f"\n{label} ({len(cards)} 张卡片):")
    for idx, card in enumerate(cards, 1):
        print(f"[{idx}] {card.title}")
        print(f"    摘要: {card.summary}")
        print(f"    链接: {card.link}")
        print(f"    发布时间: {card.published}")
        print(f"    图像提示: {card.image_prompt}")
        print(f"    调色板: {card.image_palette}  随机种子: {card.image_seed}\n")


def run_daily(limit: int, storage: CardStorage, favorites: List[int]) -> None:
    service = CardService()
    cards = service.daily_cards(limit=limit)
    _print_cards(cards, "今日热点卡片")
    for idx in favorites:
        if 0 < idx <= len(cards):
            storage.append(cards[idx - 1])
    if favorites:
        print(f"已收藏 {len(favorites)} 张卡片，存储文件: {storage.path}")


def run_more(offset: int, batch: int, storage: CardStorage, favorites: List[int]) -> None:
    service = CardService()
    cards = service.more_cards(offset=offset, batch=batch)
    _print_cards(cards, "更多热点卡片")
    for idx in favorites:
        if 0 < idx <= len(cards):
            storage.append(cards[idx - 1])
    if favorites:
        print(f"已收藏 {len(favorites)} 张卡片，存储文件: {storage.path}")


def show_favorites(storage: CardStorage) -> None:
    cards = storage.load()
    if not cards:
        print("收藏夹为空。")
        return
    _print_cards(cards, "收藏的卡片")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="世界之窗小程序模拟器")
    sub = parser.add_subparsers(dest="command", required=True)

    daily = sub.add_parser("daily", help="获取今日热点卡片")
    daily.add_argument("--limit", type=int, default=5, help="卡片数量，默认为 5")
    daily.add_argument("--favorite", type=int, nargs="*", default=[], help="将指定序号的卡片加入收藏")
    daily.add_argument("--store", type=Path, default=Path("world_window_favorites.json"), help="收藏文件路径")

    more = sub.add_parser("more", help="获取更多卡片，模拟滑到第六张后的加载")
    more.add_argument("--offset", type=int, default=5, help="从第几条之后开始获取")
    more.add_argument("--batch", type=int, default=5, help="本次拉取数量")
    more.add_argument("--favorite", type=int, nargs="*", default=[], help="将指定序号的卡片加入收藏")
    more.add_argument("--store", type=Path, default=Path("world_window_favorites.json"), help="收藏文件路径")

    fav = sub.add_parser("favorites", help="查看收藏的卡片")
    fav.add_argument("--store", type=Path, default=Path("world_window_favorites.json"), help="收藏文件路径")

    return parser


def main(argv: List[str] | None = None) -> None:
    parser = build_parser()
    args = parser.parse_args(argv)
    storage = CardStorage(path=args.store)

    if args.command == "daily":
        run_daily(limit=args.limit, storage=storage, favorites=args.favorite)
    elif args.command == "more":
        run_more(offset=args.offset, batch=args.batch, storage=storage, favorites=args.favorite)
    elif args.command == "favorites":
        show_favorites(storage=storage)


if __name__ == "__main__":
    main()
