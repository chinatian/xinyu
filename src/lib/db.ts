import { createPool, sql } from '@vercel/postgres';
import { Database } from 'sqlite';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const isProduction = process.env.NODE_ENV === 'production';

export async function getDb() {
  if (isProduction) {
    return createPool({
        connectionString: 'psql "postgres://default:oSPYq7jE6Zrd@ep-blue-sky-a4nk8rl9.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require"',
      });
  } else {
    return open({
      filename: './mydb.sqlite',
      driver: sqlite3.Database
    });
  }
}

export async function query(queryString: string, params: any[] = []) {
  if (isProduction) {
    const { rows } = await sql.query(queryString, params);
    return rows;
  } else {
    const db = await getDb();
    return  (db as Database).all(queryString, params);
  }
}