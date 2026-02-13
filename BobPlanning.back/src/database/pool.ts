import { Pool } from "pg";
import getDBConfig from "./getDBConfig";

const dbConfig = getDBConfig();

export const pool = new Pool({
  host: dbConfig.DB_HOST,
  user: dbConfig.DB_USER,
  password: dbConfig.DB_PASSWORD,
  database: dbConfig.DB_NAME,
  port: Number(dbConfig.DB_PORT),
});
