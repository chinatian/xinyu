'use client'

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface ResponseData {
  id: number;
  prompt: string;
  response: string;
  created_at: string;
}

export default function ResponsePage() {
  const [response, setResponse] = useState<ResponseData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();
  const { id } = params;

  useEffect(() => {
    const fetchResponse = async () => {
      try {
        console.log('Fetching response for ID:', id);
        const res = await fetch(`/api/claude/${id}`);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data: ResponseData = await res.json();
        console.log('Received data:', data);
        setResponse(data);
      } catch (error) {
        console.error('Error fetching response:', error);
        setError(`Error fetching response: ${(error as Error).message}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchResponse();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-purple-200">
        <div className="text-2xl font-bold">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-r from-blue-100 to-purple-200 p-4">
        <div className="w-full max-w-4xl bg-white bg-opacity-80 rounded-lg shadow-md p-6 mt-8">
          <Link href="/" className="text-blue-500 hover:underline mb-4 inline-block">&larr; 返回首页</Link>
          <h1 className="text-2xl font-bold mb-4">错误</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-purple-200">
        <div className="text-2xl font-bold">No response found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-r from-blue-100 to-purple-200 p-4">
      <div className="w-full max-w-4xl bg-white bg-opacity-80 rounded-lg shadow-md p-6 mt-8">
        <Link href="/" className="text-blue-500 hover:underline mb-4 inline-block">&larr; 返回首页</Link>
        <h1 className="text-2xl font-bold mb-4">问题: {response.prompt}</h1>
        <div className="text-gray-600 mb-4 flex justify-center" dangerouslySetInnerHTML={{ __html: response.response }} />
        <p className="text-sm text-gray-400">创建时间: {new Date(response.created_at).toLocaleString()}</p>
      </div>
    </div>
  );
}