import * as fs from 'fs';
import * as path from 'path';

// Définir une interface pour les variables de connexion
interface DBConfig {
  DB_HOST: string;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  DB_PORT: number;
}

// Fonction pour lire et parser le fichier db.conf
function getDBConfig(): DBConfig {
  const confPath = path.join(__dirname, 'config/db.conf');
  
  try {
    const fileContent = fs.readFileSync(confPath, 'utf-8');

    const config: { [K in keyof DBConfig]?: string | number } = {}; // Initialisation partielle pour éviter d'obliger tous les champs au début

    // Split le contenu par ligne et parse chaque ligne
    fileContent.split('\n').forEach((line) => {
      line = line.trim(); // Supprimer les espaces autour des lignes
      if (line && line[0] !== '#') { // Ignorer les lignes vides ou les commentaires
        const [key, value] = line.split('=');
        if (key && value) {
          const trimmedKey = key.trim() as keyof DBConfig;
          config[trimmedKey] = trimmedKey === 'DB_PORT' ? Number(value.trim()) : value.trim();
        }
      }
    });

    // Validation pour vérifier que toutes les propriétés sont bien définies
    if (
      !config.DB_HOST || 
      !config.DB_USER || 
      !config.DB_PASSWORD || 
      !config.DB_NAME || 
      !config.DB_PORT
    ) {
      throw new Error('Une ou plusieurs variables de configuration sont manquantes dans db.conf');
    }

    // On retourne les variables en tant que DBConfig
    return config as DBConfig;
  } catch (err) {
    console.error('Erreur lors de la lecture du fichier db.conf:', err);
    throw err; // Relance l'erreur après l'affichage dans la console
  }
}

export default getDBConfig;