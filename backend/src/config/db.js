import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || undefined,
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
  database: process.env.PGDATABASE || 'fafcare',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || undefined,
  max: 10,
});

export const query = (text, params) => pool.query(text, params);
