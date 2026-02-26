import type { CardData } from '../types';

export async function fetchDailyCards(limit = 5): Promise<CardData[]> {
  const res = await fetch(`/api/daily?limit=${limit}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchMoreCards(offset: number, batch = 3): Promise<CardData[]> {
  const res = await fetch(`/api/more?offset=${offset}&batch=${batch}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchFavorites(): Promise<CardData[]> {
  const res = await fetch('/api/favorites');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function saveFavorite(card: CardData): Promise<void> {
  await fetch('/api/favorites', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ card }),
  });
}

export async function deleteFavorite(cardId: string): Promise<void> {
  await fetch('/api/favorites', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: cardId }),
  });
}
