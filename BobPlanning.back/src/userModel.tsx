import { getDb } from '../db'; // Assure-toi d'avoir un module DB pour accéder à ta base de données

// Récupère un utilisateur par son email
export const getUserByEmail = async (email: string) => {
  const db = await getDb();
  const user = await db.collection('Utilisateurs').findOne({ email });
  return user;
};

// Met à jour les tentatives échouées et bloque l'utilisateur si nécessaire
export const updateFailedAttempts = async (userId: string) => {
  const db = await getDb();
  const user = await db.collection('Utilisateurs').findOne({ _id: userId });

  if (user.failedAttempts >= 10) {
    await db.collection('Utilisateurs').updateOne(
      { _id: userId },
      { $set: { blocked: true, lastFailedAttempt: new Date() } }
    );
  } else {
    await db.collection('Utilisateurs').updateOne(
      { _id: userId },
      { $inc: { failedAttempts: 1 } }
    );
  }
};
