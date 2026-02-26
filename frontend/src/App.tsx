import { useState, useMemo, useCallback, useRef } from 'react';
import type { Locale, CardData } from './types';
import { I18nContext, getMessages } from './i18n';
import { useCards } from './hooks/useCards';
import { useFavorites } from './hooks/useFavorites';
import { useToast } from './hooks/useToast';
import Hero from './components/Hero/Hero';
import CardGrid from './components/CardGrid/CardGrid';
import FavoritesPanel from './components/FavoritesPanel/FavoritesPanel';
import Toast from './components/Toast/Toast';
import LanguageSwitcher from './components/LanguageSwitcher/LanguageSwitcher';

export default function App() {
  const [locale, setLocale] = useState<Locale>('zh');
  const t = useMemo(() => getMessages(locale), [locale]);
  const favPanelRef = useRef<HTMLDivElement>(null);

  const { cards, loading, loadingMore, refresh, loadMore } = useCards();
  const { favorites, reload: reloadFavorites, addFavorite, removeFavorite, isFavorited } = useFavorites();
  const { toast, showToast } = useToast();

  const handleToggleFavorite = useCallback(async (card: CardData) => {
    if (isFavorited(card.id)) {
      await removeFavorite(card.id);
      showToast(t.toast.unfavorited, 'info');
    } else {
      await addFavorite(card);
      showToast(t.toast.favorited, 'success');
    }
  }, [addFavorite, removeFavorite, isFavorited, showToast, t]);

  const handleRemoveFavorite = useCallback(async (cardId: string) => {
    await removeFavorite(cardId);
    showToast(t.toast.unfavorited, 'info');
  }, [removeFavorite, showToast, t]);

  const handleLoadMore = useCallback(async () => {
    const hasMore = await loadMore();
    if (!hasMore) showToast(t.toast.noMore);
  }, [loadMore, showToast, t]);

  const handleViewFavorites = useCallback(async () => {
    await reloadFavorites();
    favPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [reloadFavorites]);

  const i18nValue = useMemo(() => ({ locale, t, setLocale }), [locale, t]);

  return (
    <I18nContext.Provider value={i18nValue}>
      <LanguageSwitcher />
      <Hero
        onRefresh={refresh}
        onLoadMore={handleLoadMore}
        onViewFavorites={handleViewFavorites}
        loading={loading}
        loadingMore={loadingMore}
      />
      <main className="layout">
        <CardGrid
          cards={cards}
          loading={loading}
          onToggleFavorite={handleToggleFavorite}
          isFavorited={isFavorited}
        />
        <FavoritesPanel
          ref={favPanelRef}
          favorites={favorites}
          onRefresh={reloadFavorites}
          onRemove={handleRemoveFavorite}
        />
      </main>
      <Toast toast={toast} />
    </I18nContext.Provider>
  );
}
