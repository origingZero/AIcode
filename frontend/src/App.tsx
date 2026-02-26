import { useState, useMemo, useCallback } from 'react';
import type { Locale } from './types';
import { I18nContext, getMessages } from './i18n';
import { useCards } from './hooks/useCards';
import { useFavorites } from './hooks/useFavorites';
import { useToast } from './hooks/useToast';
import Hero from './components/Hero/Hero';
import CardGrid from './components/CardGrid/CardGrid';
import FavoritesPanel from './components/FavoritesPanel/FavoritesPanel';
import Toast from './components/Toast/Toast';
import LanguageSwitcher from './components/LanguageSwitcher/LanguageSwitcher';
import type { CardData } from './types';

export default function App() {
  const [locale, setLocale] = useState<Locale>('zh');
  const t = useMemo(() => getMessages(locale), [locale]);

  const { cards, loading, loadingMore, refresh, loadMore } = useCards();
  const { favorites, reload: reloadFavorites, addFavorite } = useFavorites();
  const { toast, showToast } = useToast();

  const handleFavorite = useCallback(async (card: CardData) => {
    await addFavorite(card);
    showToast(t.toast.favorited, 'success');
  }, [addFavorite, showToast, t]);

  const handleLoadMore = useCallback(async () => {
    const hasMore = await loadMore();
    if (!hasMore) showToast(t.toast.noMore);
  }, [loadMore, showToast, t]);

  const i18nValue = useMemo(() => ({ locale, t, setLocale }), [locale, t]);

  return (
    <I18nContext.Provider value={i18nValue}>
      <LanguageSwitcher />
      <Hero
        onRefresh={refresh}
        onLoadMore={handleLoadMore}
        onViewFavorites={reloadFavorites}
        loading={loading}
        loadingMore={loadingMore}
      />
      <main className="layout">
        <CardGrid cards={cards} loading={loading} onFavorite={handleFavorite} />
        <FavoritesPanel favorites={favorites} onRefresh={reloadFavorites} />
      </main>
      <Toast toast={toast} />
    </I18nContext.Provider>
  );
}
