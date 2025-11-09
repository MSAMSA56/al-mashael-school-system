import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { translations, Language } from '../i18n';

interface LanguageStore {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'rtl' | 'ltr';
}

const getNestedValue = (obj: any, path: string): string => {
  const keys = path.split('.');
  let value = obj;
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return path;
    }
  }
  return typeof value === 'string' ? value : path;
};

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set, get) => ({
      language: 'ar',
      dir: 'rtl',

      setLanguage: (lang: Language) => {
        set({ language: lang, dir: lang === 'ar' ? 'rtl' : 'ltr' });
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      },

      t: (key: string): string => {
        const { language } = get();
        const translationObj = translations[language];
        return getNestedValue(translationObj, key);
      },
    }),
    {
      name: 'language-storage',
    }
  )
);

// Initialize language on app start
export const initLanguage = () => {
  const store = useLanguageStore.getState();
  const savedLanguage = localStorage.getItem('language-storage');
  
  if (savedLanguage) {
    try {
      const parsed = JSON.parse(savedLanguage);
      const lang = parsed.state?.language || 'ar';
      store.setLanguage(lang as Language);
    } catch {
      store.setLanguage('ar');
    }
  } else {
    store.setLanguage('ar');
  }
};
