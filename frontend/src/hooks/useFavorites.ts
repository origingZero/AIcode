import { useState, useCallback, useEffect } from 'react';
import type { CardData } from '../types';
import { fetchFavorites, saveFavorite } from '../api/cards';

export function useFavorites() {
  const [favorites, setFavorites] = useState<CardData[]>([]);

  const reload = useCallback(async () => {
    const data = await fetchFavorites();
    setFavorites(data);
  }, []);

  const addFavorite = useCallback(async (card: CardData) => {
    await saveFavorite(card);
    await reload();
  }, [reload]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { favorites, reload, addFavorite };
}
