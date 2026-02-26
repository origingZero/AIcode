import { useI18n } from '../../i18n';
import { GlobeIcon, RefreshIcon, ArrowDownIcon, HeartIcon, SpinnerIcon } from '../Icons';
import styles from './Hero.module.css';

interface Props {
  onRefresh: () => void;
  onLoadMore: () => void;
  onViewFavorites: () => void;
  loading: boolean;
  loadingMore: boolean;
}

export default function Hero({ onRefresh, onLoadMore, onViewFavorites, loading, loadingMore }: Props) {
  const { t } = useI18n();
  return (
    <header className={styles.hero}>
      <div className={styles.inner}>
        <p className={styles.eyebrow}>
          <GlobeIcon />
          {t.hero.eyebrow}
        </p>
        <h1 className={styles.heading}>{t.hero.heading}</h1>
        <p className={styles.lede}>{t.hero.lede}</p>
        <div className={styles.actions}>
          <button className="btn-primary" onClick={onRefresh} disabled={loading}>
            {loading ? <SpinnerIcon /> : <RefreshIcon />}
            {t.hero.refresh}
          </button>
          <button className="btn-ghost" onClick={onLoadMore} disabled={loadingMore}>
            {loadingMore ? <SpinnerIcon /> : <ArrowDownIcon />}
            {loadingMore ? t.toast.loading : t.hero.loadMore}
          </button>
          <button className="btn-ghost" onClick={onViewFavorites}>
            <HeartIcon />
            {t.hero.viewFavorites}
          </button>
        </div>
      </div>
    </header>
  );
}
