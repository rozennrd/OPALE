import jwt from 'jsonwebtoken';

// Fonction pour générer le token JWT
const generateToken = (user: any) => {
  const payload = {
    id: user.IdUtilisateur,
    email: user.Email
  };

  // On signe le token avec une clé secrète
  return jwt.sign(payload, 'votreCléSecrète', { expiresIn: '1h' });
};

export { generateToken };
