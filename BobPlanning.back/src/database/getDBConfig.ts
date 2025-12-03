interface DBConfig {
  DB_HOST: string;
  DB_PORT: number;
  DB_NAME: string;
  DB_USER: string;
  DB_PASSWORD: string;
}

export default function getDBConfig(): DBConfig {
  const config = {
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_PORT: parseInt(process.env.DB_PORT || '5432'),
    DB_NAME: process.env.DB_NAME!,
    DB_USER: process.env.DB_USER!,
    DB_PASSWORD: process.env.DB_PASSWORD!,
  };

  // Validation pour vérifier que toutes les propriétés sont bien définies
  if (!config.DB_HOST || !config.DB_NAME || !config.DB_USER || !config.DB_PASSWORD || !config.DB_PORT) {
    throw new Error('Une ou plusieurs variables d\'environnement de configuration sont manquantes (DB_HOST, DB_NAME, DB_USER, DB_PASSWORD, DB_PORT)');
  }

  return config;
}
