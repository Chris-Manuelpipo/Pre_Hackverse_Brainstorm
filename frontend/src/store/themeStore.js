import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const applyThemeClass = (theme) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'dark') root.classList.add('theme-dark');
  else root.classList.remove('theme-dark');
};

const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'light',

      initTheme: () => {
        applyThemeClass(get().theme);
      },

      setTheme: (theme) => {
        applyThemeClass(theme);
        set({ theme });
      },

      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark';
        applyThemeClass(next);
        set({ theme: next });
      },
    }),
    {
      name: 'ui-theme-storage',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);

export default useThemeStore;