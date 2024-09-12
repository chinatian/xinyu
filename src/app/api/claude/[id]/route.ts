import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';


async function openDb() {
    const db = await open({
      filename: './mydb.sqlite',
      driver: sqlite3.Database
    });
  
    // 确保表存在
    await db.exec(`
      CREATE TABLE IF NOT EXISTS responses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        prompt TEXT,
        response TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  
    return db;
  }
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  try {
    const db = await openDb();
    const response = await db.get('SELECT * FROM responses WHERE id = ?', id);
    await db.close();

    if (response) {
      return NextResponse.json(response);
    } else {
      return NextResponse.json({ error: 'Response not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
