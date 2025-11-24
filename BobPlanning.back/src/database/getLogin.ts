import { Request, Response } from 'express';
import { generateToken } from '../utils/jwt';
import { pool } from './pool';  // ← ici

const getLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM utilisateurs WHERE email = $1',
      [email]
    );

    const users = result.rows;

    if (users.length === 0) {
      return res.status(401).json({ message: 'Identifiants incorrects' });
    }

    const user = users[0];

    if (user.bloque) {
      return res.status(403).json({
        message: "Votre compte est bloqué. Veuillez contacter l'administrateur."
      });
    }

    if (user.password !== password) {
      await pool.query(
        'UPDATE utilisateurs SET tentatives_echouees = tentatives_echouees + 1 WHERE email = $1',
        [email]
      );

      const updated = await pool.query(
        'SELECT tentatives_echouees FROM utilisateurs WHERE email = $1',
        [email]
      );

      if (updated.rows[0].tentatives_echouees >= 5) {
        await pool.query(
          'UPDATE utilisateurs SET bloque = TRUE, date_blocage = NOW() WHERE email = $1',
          [email]
        );

        return res.status(403).json({
          message: "Votre compte est bloqué. Veuillez contacter l'administrateur."
        });
      }

      return res.status(401).json({ message: 'Identifiants incorrects' });
    }

    const token = generateToken(user);

    await pool.query(
      'UPDATE utilisateurs SET tentatives_echouees = 0 WHERE email = $1',
      [email]
    );

    return res.json({ token });

  } catch (error: any) {
    console.error('Erreur serveur:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

export { getLogin };
