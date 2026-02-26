import { useI18n } from '../../i18n';
import { LanguageIcon } from '../Icons';
import styles from './LanguageSwitcher.module.css';

export default function LanguageSwitcher() {
  const { locale, t, setLocale } = useI18n();
  return (
    <button
      className={styles.switcher}
      onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')}
      aria-label="Switch language"
    >
      <LanguageIcon />
      {t.lang.switch}
    </button>
  );
}
