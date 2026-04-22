import apiClient from './apiClient';

export const utilisateursApi = {
  // Profil public d'un utilisateur
  getById: (id) =>
    apiClient.get(`/users/${id}`).then((r) => r.data),

  // Modifier son propre profil
  updateMe: (data) =>
    apiClient.patch('/users/me', data).then((r) => r.data),

  // Changer son avatar
  uploadAvatar: (formData) =>
    apiClient.post('/upload/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),
};
