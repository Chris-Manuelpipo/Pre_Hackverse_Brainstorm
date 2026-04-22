import apiClient from './apiClient';

export const referentielApi = {
  // Toutes les matières
  getMatieres: () =>
    apiClient.get('/matieres').then((r) => r.data),

  // Tags (tri par nb_utilisations)
  getTags: () =>
    apiClient.get('/tags').then((r) => r.data),
};
