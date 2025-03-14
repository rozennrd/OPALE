import { Request, Response } from 'express';
import { generateToken } from '../utils/jwt'; 

const getLogin = async (req: Request, res: Response, connection: any) => {
  const { email, password } = req.body;

  try {
    // Exécuter la requête pour obtenir l'utilisateur
    const [users] = await connection.promise().query('SELECT * FROM Utilisateurs WHERE Email = ?', [email]);

    // Vérifier si l'utilisateur existe
    if (!users || users.length === 0) {
      return res.status(401).json({ message: 'Identifiants incorrects' });
    }

    const user = users[0]; // Récupérer le premier utilisateur

    // Vérifier si l'utilisateur est bloqué
    if (user.Bloque) {
      return res.status(403).json({ message: 'Votre compte est bloqué. Veuillez contacter l\'administrateur.' });
    }

    // Comparer directement les mots de passe hachés
    if (user.Password !== password) {
      console.log('Mot de passe incorrect');
      
      // Incrémenter le nombre de tentatives échouées
      await connection.promise().query('UPDATE Utilisateurs SET TentativesEchouees = TentativesEchouees + 1 WHERE Email = ?', [email]);

      // Si l'utilisateur dépasse 10 tentatives échouées, bloquer son compte
      const [updatedUser] = await connection.promise().query('SELECT TentativesEchouees FROM Utilisateurs WHERE Email = ?', [email]);
      
      if (updatedUser[0].TentativesEchouees >= 5) {
        const now = new Date();
        // Bloquer l'utilisateur et enregistrer la date du blocage
        await connection.promise().query('UPDATE Utilisateurs SET Bloque = TRUE, DateBlocage = ? WHERE Email = ?', [now, email]);
        return res.status(403).json({
          message: 'Votre compte est bloqué. Veuillez contacter l\'administrateur.'
        });
      }
      
      return res.status(401).json({ message: 'Identifiants incorrects' });
    }

    // Si l'utilisateur est valide, générer un token JWT
    const token = generateToken(user);

    // Réinitialiser le compteur de tentatives échouées en cas de connexion réussie
    await connection.promise().query('UPDATE Utilisateurs SET TentativesEchouees = 0 WHERE Email = ?', [email]);

    // Retourner le token en réponse
    return res.json({ token });

  } catch (error) {
    console.error('Erreur serveur:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

export { getLogin };
