import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

import axios from 'axios';

async function callHanyuxinjieAPI(word: string) {
  try {
    const response = await axios.post('https://hanyuxinjie.com/api/hyxj', { word });
    return response.data;
  } catch (error) {
    console.error('Error calling Hanyuxinjie API:', error);
    throw error;
  }
}


// 初始化数据库连接
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
    const db = await openDb();

    // 确保表存在
    await db.exec(`
      CREATE TABLE IF NOT EXISTS responses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        prompt TEXT,
        response TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 插入数据
    await db.run(
      'INSERT INTO responses (prompt, response) VALUES (?, ?)',
      [prompt, mockResponse]
    );

    await db.close();

    return NextResponse.json({ result: mockResponse });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const id = pathParts[pathParts.length - 1];

  console.log('GET request received. Path:', url.pathname);
  console.log('Extracted ID:', id);

  if (id && id !== 'claude') {
    // 获取单个响应
    try {
      console.log('Attempting to fetch single response with ID:', id);
      const db = await openDb();
      const response = await db.get('SELECT * FROM responses WHERE id = ?', id);
      await db.close();

      if (response) {
        console.log('Response found:', response);
        return NextResponse.json(response);
      } else {
        console.log('Response not found for ID:', id);
        return NextResponse.json({ error: 'Response not found' }, { status: 404 });
      }
    } catch (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  } else {
    // 获取分页响应列表
    console.log('Fetching paginated response list');
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 10; // 每页显示的记录数
    const offset = (page - 1) * limit;

    try {
      const db = await openDb();

      const [totalCount] = await db.all('SELECT COUNT(*) as count FROM responses');
      const responses = await db.all(
        'SELECT * FROM responses ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [limit, offset]
      );

      await db.close();

      return NextResponse.json({
        responses,
        totalPages: Math.ceil(totalCount.count / limit),
        currentPage: page
      });
    } catch (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
}