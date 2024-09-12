import React from 'react';
import Link from 'next/link';

interface CardProps {
  id: number;
  title: string;
  content: string;
  createdAt?: string;
}

const Card: React.FC<CardProps> = ({ id, title, content, createdAt }) => {
  return (
    <Link href={`/response/${id}`} className="block">
      <div className="bg-white bg-opacity-80 rounded-lg shadow-md p-4 flex flex-col h-full hover:shadow-lg transition-shadow">
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        <div className="text-gray-600 overflow-hidden flex-grow">
          <div dangerouslySetInnerHTML={{ __html: content }} className="max-w-full" />
        </div>
        {createdAt && <p className="text-xs text-gray-400 mt-2">创建时间: {createdAt}</p>}
      </div>
    </Link>
  );
};

export default Card;