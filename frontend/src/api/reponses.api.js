import apiClient from './apiClient';

export const reponsesApi = {
  // Lister les réponses d'une question
  getByQuestion: (questionId) =>
    apiClient.get(`/reponses/question/${questionId}`).then((r) => r.data),

  // Poster une réponse
  create: (questionId, contenu) =>
    apiClient.post(`/reponses/question/${questionId}`, { contenu }).then((r) => r.data),

  // Accepter une réponse comme solution
  accept: (reponseId) =>
    apiClient.post(`/reponses/${reponseId}/accept`).then((r) => r.data),

  // Modifier sa réponse
  update: (reponseId, contenu) =>
    apiClient.patch(`/reponses/${reponseId}`, { contenu }).then((r) => r.data),

  // Supprimer sa réponse
  remove: (reponseId) =>
    apiClient.delete(`/reponses/${reponseId}`).then((r) => r.data),
};
