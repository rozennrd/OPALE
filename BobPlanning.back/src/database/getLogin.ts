import { Request, Response } from 'express';
import CryptoJS from 'crypto-js';
import { generateToken } from '../utils/jwt'; // Assurez-vous d'avoir bien créé ce fichier

const getLogin = async (req: Request, res: Response, connection: any) => {
  const { email, password } = req.body;

  console.log('Requête reçue avec email:', email); // Debug

  try {
    // Exécuter la requête pour obtenir l'utilisateur
    const [users] = await connection.promise().query('SELECT * FROM Utilisateurs WHERE Email = ?', [email]);

    // Vérifier si l'utilisateur existe
    if (!users || users.length === 0) {
      return res.status(401).json({ message: 'Identifiants incorrects' });
    }

    const user = users[0]; // Récupérer le premier utilisateur

    console.log('Utilisateur trouvé:', user); // Debug

    // Comparer directement les mots de passe hachés
    if (user.Password !== password) {
      console.log('Mot de passe incorrect');
      return res.status(401).json({ message: 'Identifiants incorrects' });
    }

    // Si l'utilisateur est valide, générer un token JWT
    const token = generateToken(user);

    // Retourner le token en réponse
    return res.json({ token });
    
  } catch (error) {
    console.error('Erreur serveur:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

export { getLogin };
