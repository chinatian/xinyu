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
        document.title = data.prompt;
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

  const downloadImage = () => {
    if (response) {
      const svgContent = response.response.replace(/width="[^"]*"\s*height="[^"]*"/, 'width="400" height="600"');
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${response.prompt}.png`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }
          }, 'image/png');
        }
      };
      img.src = url;
    }
  };

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-100 to-purple-200 p-4">
      <div className="w-full max-w-[500px]">
        <Link href="/" className="text-blue-500 hover:underline fixed top-4 left-4 z-10">&larr; 返回首页</Link>
        
        <div className="bg-white bg-opacity-80 rounded-lg shadow-md p-6 mb-4">
          <div className="text-gray-600 mb-4 flex justify-center" dangerouslySetInnerHTML={{ __html: response.response.replace(/width="[^"]*"\s*height="[^"]*"/, 'width="400" height="600"') }} />
          <p className="text-sm text-gray-400">创建时间: {new Date(response.created_at).toLocaleString()}</p>
        </div>
        
        <button 
          onClick={downloadImage}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          保存为 PNG 图片
        </button>
      </div>
    </div>
  );
}