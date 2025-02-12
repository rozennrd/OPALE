// authUtils.ts
export const isTokenExpired = (token: string | null): boolean => {
    if (!token) return true; // Si pas de token, on considère expiré
  
    try {
      const payload = JSON.parse(atob(token.split('.')[1])); // Décode le payload JWT
      const expiration = payload.exp * 1000; // Convertir en millisecondes
      return Date.now() > expiration; // Vérifie si la date actuelle dépasse l'expiration
    } catch (e) {
      console.error('Erreur lors de la vérification du token:', e);
      return true; // Si une erreur survient, on suppose expiré
    }
  };
  