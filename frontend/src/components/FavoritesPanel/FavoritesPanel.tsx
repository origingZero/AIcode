import { forwardRef } from 'react';
import type { CardData } from '../../types';
import { useI18n } from '../../i18n';
import { pickColor, formatTime, stripHtml, truncate } from '../../utils/helpers';
import { ClockIcon } from '../Icons';
import styles from './FavoritesPanel.module.css';

interface Props {
  favorites: CardData[];
  onRefresh: () => void;
  onRemove: (cardId: string) => void;
}

const FavoritesPanel = forwardRef<HTMLDivElement, Props>(
  function FavoritesPanel({ favorites, onRefresh, onRemove }, ref) {
    const { t } = useI18n();
    return (
      <aside className={styles.panel} ref={ref}>
        <div className={styles.header}>
          <h3 className={styles.title}>{t.favorites.title}</h3>
          <button className="btn-link" onClick={onRefresh}>{t.favorites.refresh}</button>
        </div>
        <div className={styles.list} aria-live="polite">
          {favorites.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>&#9825;</div>
              <p className={styles.emptyText}>{t.favorites.empty}</p>
            </div>
          ) : (
            favorites.map((card) => {
              const color = pickColor(card.image_seed);
              return (
                <div key={card.id} className={styles.item}>
                  <div className={styles.itemBar} style={{ background: color }} />
                  <div className={styles.itemContent}>
                    <h4 className={styles.itemTitle}>{stripHtml(card.title)}</h4>
                    <p className={styles.itemSummary}>{truncate(stripHtml(card.summary), 80)}</p>
                    <div className={styles.itemFooter}>
                      <span className={styles.itemTime}>
                        <ClockIcon width={10} height={10} />
                        {formatTime(card.published, t.card.unknownTime)}
                      </span>
                      <button
                        className={styles.removeBtn}
                        onClick={() => onRemove(card.id)}
                        title={t.favorites.remove}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>
    );
  },
);

export default FavoritesPanel;
