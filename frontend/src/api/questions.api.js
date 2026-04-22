import apiClient from './apiClient';

export const questionsApi = {
  // Feed paginé avec filtres
  getAll: (params = {}) =>
    apiClient.get('/questions', { params }).then((r) => r.data),

  // Détail d'une question
  getById: (id) =>
    apiClient.get(`/questions/${id}`).then((r) => r.data),

  // Créer une question
  create: (data) =>
    apiClient.post('/questions', data).then((r) => r.data),

  // Modifier une question
  update: (id, data) =>
    apiClient.patch(`/questions/${id}`, data).then((r) => r.data),

  // Supprimer une question
  remove: (id) =>
    apiClient.delete(`/questions/${id}`).then((r) => r.data),

  // Recherche full-text
  search: (q, params = {}) =>
    apiClient.get('/questions/search', { params: { q, ...params } }).then((r) => r.data),

  // Détection de doublons avant soumission
  checkDuplicates: (titre) =>
    apiClient.get('/questions/duplicates', { params: { titre } }).then((r) => r.data),
};
