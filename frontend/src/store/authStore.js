import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../api/auth.api';
import { getErrorMessage } from '../utils/errorUtils';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // ── Connexion réelle ───────────────────────────────────────────────────
      loginAsync: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const data = await authApi.login(email, password);
          // Le backend renvoie : { token, user: { id, pseudo, email, ... } }
          set({
            user: data.user ?? data,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });
          return { success: true };
        } catch (err) {
          const error = getErrorMessage(err);
          set({ isLoading: false, error });
          return { success: false, error };
        }
      },

      // ── Inscription réelle ─────────────────────────────────────────────────
      registerAsync: async (pseudo, email, password) => {
        set({ isLoading: true, error: null });
        try {
          const data = await authApi.register(pseudo, email, password);
          set({
            user: data.user ?? data,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });
          return { success: true };
        } catch (err) {
          const error = getErrorMessage(err);
          set({ isLoading: false, error });
          return { success: false, error };
        }
      },

      // ── Vérification du token au démarrage ────────────────────────────────
      initAuth: async () => {
        const { token } = get();
        if (!token) return;
        try {
          const user = await authApi.getMe();
          set({ user, isAuthenticated: true });
        } catch {
          // Token invalide ou expiré
          set({ user: null, token: null, isAuthenticated: false });
        }
      },

      // ── Déconnexion ────────────────────────────────────────────────────────
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false, error: null });
      },

      // ── Mise à jour locale du profil ───────────────────────────────────────
      updateUser: (updates) => {
        set((state) => ({ user: { ...state.user, ...updates } }));
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;