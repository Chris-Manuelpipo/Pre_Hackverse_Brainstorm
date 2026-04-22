import apiClient from './apiClient';

export const votesApi = {
  // Voter (+1 upvote / -1 downvote)
  vote: (reponseId, valeur) =>
    apiClient.post(`/votes/${reponseId}`, { valeur }).then((r) => r.data),

  // Annuler son vote
  unvote: (reponseId) =>
    apiClient.delete(`/votes/${reponseId}`).then((r) => r.data),
};
