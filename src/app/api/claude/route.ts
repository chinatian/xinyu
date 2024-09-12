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
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 10; // 每页显示的记录数

  try {
    const db = await openDb();
    const offset = (page - 1) * limit;

    const [responses, totalCount] = await Promise.all([
      db.all('SELECT * FROM responses ORDER BY created_at DESC LIMIT ? OFFSET ?', [limit, offset]),
      db.get('SELECT COUNT(*) as count FROM responses')
    ]);

    await db.close();

    const totalPages = Math.ceil(totalCount.count / limit);

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