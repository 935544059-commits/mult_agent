import React, { useState } from 'react';
import { Search, X, Plus, ChevronDown, ChevronUp, Database, Wifi, Cpu, Shield, FileSearch, Terminal } from 'lucide-react';

export interface APIItem {
  id: string;
  name: string;
  description: string;
  scenarios: string[];
  category: string;
  icon: React.ReactNode;
}

const apiLibrary: APIItem[] = [
  {
    id: 'port-scan',
    name: '端口诊断',
    description: '扫描目标设备的开放端口，检测网络连接状态',
    scenarios: ['网络不通', '连接超时', '服务不可达'],
    category: '网络诊断',
    icon: <Wifi className="w-5 h-5" />
  },
  {
    id: 'protocol-analyze',
    name: '协议分析',
    description: '分析网络协议数据包，识别异常流量',
    scenarios: ['通信异常', '数据丢失', '延迟过高'],
    category: '网络诊断',
    icon: <Database className="w-5 h-5" />
  },
  {
    id: 'cpu-monitor',
    name: 'CPU监控',
    description: '获取设备CPU使用率和进程信息',
    scenarios: ['设备卡顿', '响应缓慢', '资源占用过高'],
    category: '系统监控',
    icon: <Cpu className="w-5 h-5" />
  },
  {
    id: 'security-check',
    name: '安全检测',
    description: '检查设备安全状态，识别潜在威胁',
    scenarios: ['权限异常', '入侵检测', '漏洞扫描'],
    category: '安全防护',
    icon: <Shield className="w-5 h-5" />
  },
  {
    id: 'log-query',
    name: '日志查询',
    description: '查询设备运行日志，定位问题根源',
    scenarios: ['故障排查', '错误分析', '性能追踪'],
    category: '日志分析',
    icon: <FileSearch className="w-5 h-5" />
  },
  {
    id: 'command-exec',
    name: '命令执行',
    description: '远程执行系统命令，获取执行结果',
    scenarios: ['配置检查', '状态查询', '故障修复'],
    category: '系统管理',
    icon: <Terminal className="w-5 h-5" />
  }
];

interface AtomicApiLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStep: (api: APIItem) => void;
  disabledIds?: string[];
}

export default function AtomicApiLibrary({ isOpen, onClose, onAddStep, disabledIds = [] }: AtomicApiLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(apiLibrary.map(item => item.category)));

  const filteredApis = apiLibrary.filter(api =>
    api.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    api.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    api.scenarios.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleCategory = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/50" onClick={onClose} />
      <div className="w-96 bg-white h-full shadow-xl overflow-hidden flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">原子 API 能力库</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索 API..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {categories.map(category => {
            const categoryApis = filteredApis.filter(api => api.category === category);
            if (categoryApis.length === 0) return null;

            return (
              <div key={category} className="border rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left"
                >
                  <span className="font-medium text-gray-700">{category}</span>
                  {expandedCategory === category ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </button>
                {expandedCategory === category && (
                  <div className="p-2 space-y-2">
                    {categoryApis.map(api => {
                      const isDisabled = disabledIds.includes(api.id);
                      return (
                        <div
                          key={api.id}
                          className={`p-3 rounded-lg border transition-all ${
                            isDisabled ? 'bg-gray-50 opacity-50 cursor-not-allowed' : 'bg-white hover:border-blue-300 hover:shadow-sm'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600">
                                {api.icon}
                              </div>
                              <span className="font-medium text-gray-800">{api.name}</span>
                            </div>
                            {!isDisabled && (
                              <button
                                onClick={() => onAddStep(api)}
                                className="p-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                title="添加到执行计划"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mb-2">{api.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {api.scenarios.map((scenario, index) => (
                              <span
                                key={index}
                                className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full"
                              >
                                {scenario}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}