'use client'
import { useState, useEffect } from "react";
import Card from "../components/Card";

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState("");
  const [responses, setResponses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);

  const validateInput = (text: string): boolean => {
    if (text.trim().length === 0) {
      setInputError("输入不能为空");
      return false;
    }
    if (text.length > 10) {
      setInputError("输入不能超过10个汉字");
      return false;
    }
    setInputError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInput(inputText)) {
      setTimeout(() => setInputError(null), 3000); // 3秒后自动消失
      return;
    }
    setIsLoading(true);
    setSubmitError(null);
    try {
      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: inputText }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setResult(data.result);
      fetchResponses(1); // 刷新历史记录
      setInputText(""); // 清空输入框
    } catch (error) {
      console.error('Error:', error);
      setSubmitError("服务器开了小差，请稍后再试。");
      setTimeout(() => setSubmitError(null), 3000); // 3秒后自动消失
    } finally {
      setIsLoading(false);
    }
  };

  const fetchResponses = async (page: number) => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const response = await fetch(`/api/claude?page=${page}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setResponses(data.responses);
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching responses:', error);
      setFetchError("获取历史记录时出错，请稍后再试。");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResponses(1);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-r from-blue-100 to-purple-200 p-4">
      <div className="w-full max-w-6xl">
        <h1 className="text-4xl font-bold text-center my-8 text-gray-800">
          汉语新解
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 mb-8">
          <div className="w-full flex items-center gap-4">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="在此输入文本（最多10个汉字）"
              className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white bg-opacity-50"
              disabled={isLoading}
            />
            <button
              type="submit"
              className={`text-white px-4 py-2 rounded-md transition-colors ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-300 hover:bg-blue-400'
              }`}
              disabled={isLoading}
            >
              {isLoading ? '提交中...' : '提交'}
            </button>
          </div>
          {inputError && (
            <div className="w-full bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{inputError}</span>
            </div>
          )}
        </form>
        
        {submitError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">错误！</strong>
            <span className="block sm:inline"> {submitError}</span>
          </div>
        )}

        <h2 className="text-2xl font-bold mt-8 mb-4">历史记录</h2>
        {fetchError ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">错误！</strong>
            <span className="block sm:inline"> {fetchError}</span>
          </div>
        ) : isLoading ? (
          <div className="text-center">加载中...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {responses.map((response: any) => (
              <Card 
                key={response.id}
                id={response.id}
                title={`问题: ${response.prompt}`} 
                content={response.response}
                createdAt={new Date(response.created_at).toLocaleString()}
              />
            ))}
          </div>
        )}
        <div className="flex justify-center mt-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => fetchResponses(page)}
              className={`mx-1 px-3 py-1 rounded ${
                currentPage === page ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
        <div className="mt-8 text-sm text-gray-600 bg-white bg-opacity-80 rounded-lg p-4">
          <h3 className="font-semibold mb-2">免责声明：</h3>
          <p>
            本网站提供的信息仅供参考。我们不对信息的准确性、完整性或适用性做出任何保证。
            使用本网站提供的信息所产生的风险由用户自行承担。请在做出任何决定之前，务必进行独立验证和咨询专业意见。请务必尊重当地法律法规！
          </p>
        </div>
      </div>
    </div>
  );
}

