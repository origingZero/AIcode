import { useMemo } from 'react';
import type { CardData } from '../../types';
import { useI18n } from '../../i18n';
import NewsCard from '../NewsCard/NewsCard';
import styles from './CardGrid.module.css';

interface Props {
  cards: CardData[];
  loading: boolean;
  onFavorite: (card: CardData) => Promise<void>;
}

export default function CardGrid({ cards, loading, onFavorite }: Props) {
  const { t } = useI18n();

  const skeletons = useMemo(
    () => Array.from({ length: 6 }, (_, i) => ({
      key: i,
      height: 140 + Math.random() * 100,
    })),
    [],
  );

  return (
    <section className={styles.board}>
      <h2 className={styles.heading}>{t.cardGrid.title}</h2>
      <div className={styles.grid} aria-live="polite">
        {loading
          ? skeletons.map((s) => (
              <div key={s.key} className={styles.skeleton} style={{ minHeight: s.height }} />
            ))
          : cards.map((card, i) => (
              <NewsCard key={card.id} card={card} index={i} onFavorite={onFavorite} />
            ))}
      </div>
      {!loading && cards.length === 0 && (
        <p className={styles.empty}>{t.cardGrid.empty}</p>
      )}
    </section>
  );
}
