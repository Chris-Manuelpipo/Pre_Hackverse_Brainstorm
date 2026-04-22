/**
 * Extrait un message d'erreur lisible depuis une erreur Axios ou JS.
 */
export function getErrorMessage(err) {
  if (!err) return 'Une erreur est survenue.';

  // Réponse Axios avec un body structuré
  const data = err?.response?.data;
  if (data) {
    if (typeof data === 'string') return data;
    if (data.error) return data.error;
    if (data.message) return data.message;
    // express-validator — tableau d'erreurs
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors[0].msg || data.errors[0].message;
    }
  }

  // Timeout / réseau
  if (err.code === 'ECONNABORTED') return 'La requête a expiré. Vérifiez votre connexion.';
  if (err.code === 'ERR_NETWORK') return 'Impossible de joindre le serveur.';

  return err.message || 'Une erreur est survenue.';
}
