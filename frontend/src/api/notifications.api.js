import apiClient from './apiClient';

export const notificationsApi = {
  // Mes 30 dernières notifications
  getAll: () =>
    apiClient.get('/notifications').then((r) => r.data),

  // Compteur de non-lues (badge header)
  getUnreadCount: () =>
    apiClient.get('/notifications/unread-count').then((r) => r.data),

  // Marquer toutes comme lues
  markAllRead: () =>
    apiClient.patch('/notifications/read-all').then((r) => r.data),

  // Marquer une seule comme lue
  markRead: (id) =>
    apiClient.patch(`/notifications/${id}/read`).then((r) => r.data),
};
