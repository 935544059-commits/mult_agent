import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    window.location.href = '/chat';
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">🔄</div>
        <p className="text-gray-600">正在跳转到对话页面...</p>
      </div>
    </div>
  );
}