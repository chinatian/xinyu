import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  try {
    const responses = await query(
      'SELECT * FROM responses WHERE id = $1',
      [id]
    );

    if (responses && responses.length > 0) {
      return NextResponse.json(responses[0]);
    } else {
      return NextResponse.json({ error: 'Response not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
