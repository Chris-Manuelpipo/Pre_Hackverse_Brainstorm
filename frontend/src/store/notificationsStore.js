import { create } from 'zustand';
import { notificationsApi } from '../api/notifications.api';

const useNotificationsStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchUnreadCount: async () => {
    try {
      const data = await notificationsApi.getUnreadCount();
      set({ unreadCount: data.count ?? 0 });
    } catch {/* silencieux */}
  },

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const data = await notificationsApi.getAll();
      set({ notifications: data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  markAllRead: async () => {
    try {
      await notificationsApi.markAllRead();
      set((state) => ({
        unreadCount: 0,
        notifications: state.notifications.map((n) => ({ ...n, est_lue: true })),
      }));
    } catch {/* silencieux */}
  },

  markRead: async (id) => {
    try {
      await notificationsApi.markRead(id);
      set((state) => ({
        unreadCount: Math.max(0, state.unreadCount - 1),
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, est_lue: true } : n
        ),
      }));
    } catch {/* silencieux */}
  },
}));

export default useNotificationsStore;
