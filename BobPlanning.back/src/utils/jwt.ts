import jwt from 'jsonwebtoken';
import config from '../config/auth.config';

const generateToken = (user: any) => {
  const payload = {
    id: user.id_utilisateur,
    email: user.email
  };

  // On signe le token avec une clé secrète
  return jwt.sign(payload, config.secret, { expiresIn: '12h' });
};

export { generateToken };
