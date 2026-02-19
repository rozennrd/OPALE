import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';

// Try to load .env from multiple possible locations
// 1. BobPlanning.back/.env (for local backend development and Jest tests)
// 2. BobPlanning.database/.env (for local development with monorepo structure)
// 3. Root directory .env (for monorepo setups)

const possibleEnvPaths = [
  path.resolve(__dirname, '..', '..', '.env'), // BobPlanning.back/.env
  path.resolve(__dirname, '..', '..', '..', 'BobPlanning.database', '.env'), // BobPlanning.database/.env
  path.resolve(__dirname, '..', '..', '..', '.env'), // Root .env
];

let envLoadResult: dotenv.DotenvConfigOutput = {};

for (const envPath of possibleEnvPaths) {
  if (fs.existsSync(envPath)) {
    envLoadResult = dotenv.config({ path: envPath });
    if (envLoadResult.parsed) {
      break;
    }
  }
}

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
    DB_NAME: process.env.DB_NAME || '',
    DB_USER: process.env.DB_USER || '',
    DB_PASSWORD: process.env.DB_PASSWORD || '',
  };

  // Collect missing variables to provide a helpful error message
  const missing: string[] = [];
  if (!config.DB_HOST) missing.push('DB_HOST');
  if (!config.DB_NAME) missing.push('DB_NAME');
  if (!config.DB_USER) missing.push('DB_USER');
  if (!config.DB_PASSWORD) missing.push('DB_PASSWORD');
  if (!config.DB_PORT) missing.push('DB_PORT');

  if (missing.length > 0) {
    const dotenvInfo = envLoadResult.parsed ? 'found .env and parsed values' : `dotenv load error: ${envLoadResult.error ? envLoadResult.error.message : 'no .env found or parsed'}`;
    throw new Error(
      `Une ou plusieurs variables d'environnement de configuration sont manquantes: ${missing.join(', ')}; ${dotenvInfo}`,
    );
  }

  return {
    DB_HOST: config.DB_HOST,
    DB_PORT: config.DB_PORT,
    DB_NAME: config.DB_NAME,
    DB_USER: config.DB_USER,
    DB_PASSWORD: config.DB_PASSWORD,
  };
}
