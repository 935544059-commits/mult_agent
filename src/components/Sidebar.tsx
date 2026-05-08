import React from 'react';
import { useRouter } from 'next/router';
import { Bot, MessageCircle, Settings } from 'lucide-react';

interface SidebarProps {
  activeView: 'chat' | 'admin';
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView }) => {
  const router = useRouter();

  const menuItems = [
    {
      id: 'chat',
      label: '用户视图',
      icon: MessageCircle,
      path: '/chat',
    },
    {
      id: 'admin',
      label: '后台管理',
      icon: Settings,
      path: '/admin',
    },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col flex-shrink-0">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Bot className="w-6 h-6 text-blue-600" />
          <span className="font-bold text-gray-800">智能体应用</span>
        </div>
      </div>

      <nav className="flex-1 p-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => router.push(item.path)}
              className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
