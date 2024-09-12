import { NextResponse } from 'next/server';
import { openDb } from '@/lib/db';

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
