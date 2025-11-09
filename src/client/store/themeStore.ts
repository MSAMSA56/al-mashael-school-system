import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeStore {
  isDark: boolean;
  language: 'ar' | 'en';
  toggleTheme: () => void;
  setLanguage: (lang: 'ar' | 'en') => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      isDark: true,
      language: 'ar',
      toggleTheme: () => {
        set((state) => ({ isDark: !state.isDark }));
      },
      setLanguage: (lang: 'ar' | 'en') => {
        set({ language: lang });
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);
