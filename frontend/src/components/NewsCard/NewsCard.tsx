import { useState } from 'react';
import type { CardData } from '../../types';
import { useI18n } from '../../i18n';
import { pickColor, formatTime, stripHtml, truncate } from '../../utils/helpers';
import { HeartIcon, HeartFilledIcon, ExternalLinkIcon, ClockIcon } from '../Icons';
import styles from './NewsCard.module.css';

interface Props {
  card: CardData;
  index: number;
  onToggleFavorite: (card: CardData) => Promise<void>;
  isFavorited: boolean;
}

export default function NewsCard({ card, index, onToggleFavorite, isFavorited }: Props) {
  const { t } = useI18n();
  const [imgError, setImgError] = useState(false);
  const color = pickColor(card.image_seed);
  const cleanTitle = stripHtml(card.title);
  const cleanSummary = truncate(stripHtml(card.summary), 140);
  const cleanPrompt = truncate(stripHtml(card.image_prompt), 80);

  return (
    <article
      className={`${styles.card} ${styles.animateIn}`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className={styles.imageWrap}>
        {card.image_url && !imgError ? (
          <img
            className={styles.image}
            src={card.image_url}
            alt=""
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className={styles.imageFallback}
            style={{ background: `linear-gradient(135deg, ${color}44, ${color}cc)` }}
          />
        )}
        <div className={styles.imageOverlay} />
        <span className={styles.badge}>{t.card.aiBadge}</span>
      </div>

      <div className={styles.body}>
        <h3 className={styles.title}>{cleanTitle}</h3>
        <p className={styles.summary}>{cleanSummary}</p>
        <p className={styles.prompt}>
          <strong>{t.card.prompt}</strong>{'　'}{cleanPrompt}
        </p>
        <span className={styles.time}>
          <ClockIcon />
          {formatTime(card.published, t.card.unknownTime)}
        </span>
      </div>

      <div className={styles.footer}>
        <button
          className={`${isFavorited ? 'btn-saved' : 'btn-primary'} ${styles.favBtn}`}
          onClick={() => onToggleFavorite(card)}
        >
          {isFavorited
            ? <><HeartFilledIcon width={14} height={14} />{t.card.favorited}</>
            : <><HeartIcon width={14} height={14} />{t.card.favorite}</>
          }
        </button>
        <a className="btn-ghost" href={card.link} target="_blank" rel="noreferrer">
          <ExternalLinkIcon />
          {t.card.viewOriginal}
        </a>
      </div>
    </article>
  );
}
