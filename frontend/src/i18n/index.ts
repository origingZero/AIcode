import { createContext, useContext } from 'react';
import type { Locale } from '../types';
import zh from './zh';
import en from './en';

export type Messages = typeof zh;

const locales: Record<Locale, Messages> = { zh, en };

export function getMessages(locale: Locale): Messages {
  return locales[locale];
}

interface I18nContextValue {
  locale: Locale;
  t: Messages;
  setLocale: (l: Locale) => void;
}

export const I18nContext = createContext<I18nContextValue>({
  locale: 'zh',
  t: zh,
  setLocale: () => {},
});

export function useI18n() {
  return useContext(I18nContext);
}
