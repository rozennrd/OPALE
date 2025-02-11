import jwt from 'jsonwebtoken';

const generateToken = (user: any) => {
  const payload = {
    id: user.IdUtilisateur,
    email: user.Email
  };

  return jwt.sign(payload, 'votreCléSecrète', { expiresIn: '1h' });
};

export { generateToken };
