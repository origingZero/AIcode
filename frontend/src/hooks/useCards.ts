import { useState, useCallback, useEffect } from 'react';
import type { CardData } from '../types';
import { fetchDailyCards, fetchMoreCards } from '../api/cards';

export function useCards() {
  const [cards, setCards] = useState<CardData[]>([]);
  const [offset, setOffset] = useState(5);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchDailyCards(5);
      setCards(data);
      setOffset(data.length);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async (): Promise<boolean> => {
    setLoadingMore(true);
    try {
      const data = await fetchMoreCards(offset, 3);
      if (!data.length) return false;
      setCards((prev) => [...prev, ...data]);
      setOffset((prev) => prev + data.length);
      return true;
    } finally {
      setLoadingMore(false);
    }
  }, [offset]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { cards, loading, loadingMore, refresh, loadMore };
}
