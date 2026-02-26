import { useState, useCallback, useEffect, useMemo } from 'react';
import type { CardData } from '../types';
import { fetchFavorites, saveFavorite, deleteFavorite } from '../api/cards';

export function useFavorites() {
  const [favorites, setFavorites] = useState<CardData[]>([]);

  const favoriteIds = useMemo(
    () => new Set(favorites.map((c) => c.id)),
    [favorites],
  );

  const reload = useCallback(async () => {
    const data = await fetchFavorites();
    setFavorites(data);
  }, []);

  const addFavorite = useCallback(async (card: CardData) => {
    await saveFavorite(card);
    await reload();
  }, [reload]);

  const removeFavorite = useCallback(async (cardId: string) => {
    await deleteFavorite(cardId);
    await reload();
  }, [reload]);

  const isFavorited = useCallback((cardId: string) => favoriteIds.has(cardId), [favoriteIds]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { favorites, favoriteIds, reload, addFavorite, removeFavorite, isFavorited };
}
