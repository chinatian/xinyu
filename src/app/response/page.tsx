'use client'
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ResponsePage() {
  const searchParams = useSearchParams();
  const prompt = searchParams.get('prompt');
  const result = searchParams.get('result');

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-blue-100 to-purple-200">
      <div className="flex-grow flex flex-col items-center justify-start p-4">
        <div className="w-full max-w-6xl">
          <h1 className="text-4xl font-bold text-center my-8 text-gray-800">
            响应结果
          </h1>
          <div className="bg-white bg-opacity-80 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">问题：</h2>
            <p className="text-lg mb-6">{prompt}</p>
            <h2 className="text-2xl font-semibold mb-4">回答：</h2>
            <p className="text-lg">{result}</p>
          </div>
          <Link href="/" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}