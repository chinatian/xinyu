import { NextResponse } from 'next/server';
import { query } from '@/lib/db';



import axios from 'axios';

async function callHanyuxinjieAPI(word: string) {
  try {
    const response = await axios.post('https://hanyuxinjie.com/api/hyxj', { word }, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Origin': 'https://hanyuxinjie.com',
        'Referer': 'https://hanyuxinjie.com/',
        'Cookie': '_ga=GA1.1.153758186.1726111827; _clck=trxxe7%7C2%7Cfp4%7C0%7C1716; _clsk=d5n860%7C1726124788255%7C8%7C1%7Ct.clarity.ms%2Fcollect; _ga_PCWP41T8Q0=GS1.1.1726120765.4.1.1726124800.0.0.0',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error calling Hanyuxinjie API:', error);
    throw error;
  }
}


export async function POST(request: Request) {
  const { prompt } = await request.json();

  // 调用 Hanyuxinjie API
  let hanyuxinjieResponse;
  let  svgImage
  try {
    hanyuxinjieResponse = await callHanyuxinjieAPI(prompt);
    // 处理 Hanyuxinjie API 的响应
    svgImage = hanyuxinjieResponse.data.image;
    
   
  } catch (error) {
    console.error('Error calling Hanyuxinjie API:', error);
    return NextResponse.json({ error: 'Error calling Hanyuxinjie API' }, { status: 500 });
  }



  // 这里应该是调用 Claude API 的代码
  // 由于我们没有实际的 API 访问，这里用模拟响应代替
  const mockResponse = svgImage

  try {
    await query(`
      CREATE TABLE IF NOT EXISTS responses (
        id SERIAL PRIMARY KEY,
        prompt TEXT,
        response TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const result = await query(
      'INSERT INTO responses (prompt, response) VALUES ($1, $2) RETURNING id',
      [prompt, mockResponse]
    );

    const insertedId = result[0].id;

    return NextResponse.json({ result: mockResponse, id: insertedId });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 10; // 每页显示的记录数

  try {
    const offset = (page - 1) * limit;

    const responses = await query(
      'SELECT * FROM responses ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    const totalCountResult = await query('SELECT COUNT(*) as count FROM responses');
    const totalCount = totalCountResult[0].count;

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      responses,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}