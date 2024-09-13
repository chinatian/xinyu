import { NextResponse } from 'next/server';
import { query } from '@/lib/db'; // Add this import

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  try {
    const response = await query(
      'SELECT * FROM responses WHERE id = $1',
      [parseInt(id)]
    );
    if (response.length === 0) {
      return new NextResponse('Response not found', { status: 404 });
    }
    const responseData = response[0];

    // 假设 responseData.response 字段包含 SVG 内容
    const svgContent = responseData.response;

    return new NextResponse(svgContent, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error fetching SVG:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}