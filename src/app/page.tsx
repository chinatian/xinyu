'use client'
import { useState, useEffect } from "react";
import Card from "../components/Card";
import Link from 'next/link';
import Footer from "../components/Footer";  // 导入 Footer 组件
import { useRouter } from 'next/navigation';

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

  const router = useRouter();

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
      // 使用 router.push 进行导航
      router.push(`/response/${data.id}`);
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
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-blue-100 to-purple-200">
      {/* 顶部导航栏 */}
      <nav className="w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                Xinyu
              </Link>
            </div>
            {/* 如果需要，这里可以添加更多的导航项 */}
          </div>
        </div>
      </nav>

      {/* 页面主体内容 */}
      <div className="flex-grow flex flex-col items-center justify-start p-4">
        <div className="w-full max-w-6xl">
          <h1 className="text-4xl font-bold text-center my-8 text-gray-800">
            汉语新解
          </h1>
          <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 mb-8">
            <div className="w-full max-w-xl flex items-center gap-4">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="在此输入文本（最多10个汉字）"
                className="flex-grow px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white bg-opacity-50 text-lg"
                disabled={isLoading}
              />
              <button
                type="submit"
                className={`px-6 text-white py-3 rounded-md transition-colors text-lg ${
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
              <div className="w-full max-w-xl bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
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

          {fetchError ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">错误！</strong>
              <span className="block sm:inline"> {fetchError}</span>
            </div>
          ) : isLoading ? (
            <div className="text-center min-h-[66vh] flex items-center justify-center">
              <p>加载中...</p>
            </div>
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
          
          <div className="mt-8 text-sm text-gray-600 bg-white bg-opacity-80 rounded-lg p-4">
            <h3 className="font-semibold mb-2">免责声明：</h3>
            <p>
              本网站提供的信息仅供参考。我们不对信息的准确性、完整性或适用性做出任何保证。
              使用本网站提供的信息所产生的风险由用户自行承担。请在做出任何决定之前，务必进行独立验证和咨询专业意见。请务必尊重当地法律法规！
            </p>
          </div>
        </div>
      </div>

      {/* 添加 Footer 组件 */}
      <Footer />
    </div>
  );
}

