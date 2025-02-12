import jwt from 'jsonwebtoken';
import config from '../config/auth.config';

const generateToken = (user: any) => {
  const payload = {
    id: user.IdUtilisateur,
    email: user.Email
  };

  // On signe le token avec une clé secrète
  return jwt.sign(payload, config.secret, { expiresIn: '12h' });
};

export { generateToken };
