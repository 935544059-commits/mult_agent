import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Plus, 
  Trash2, 
  Settings, 
  Bot, 
  Lock,
  FileText,
  Home,
  ChevronRight
} from 'lucide-react';
import { AgentModeSwitch } from '@/components/AgentModeSwitch';
import { Sidebar } from '@/components/Sidebar';
import { AgentConfig, APIConfig, AgentMode } from '@/types';
import { getAgentConfig, updateAgentConfig, createToolkit, deleteToolkit } from '@/services/mockApi';

export default function AdminPage() {
  const [agent, setAgent] = useState<AgentConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<AgentMode>('react');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [apiConfig, setApiConfig] = useState<APIConfig>({
    id: '',
    name: '',
    url: '',
    method: 'GET',
    authType: 'NONE',
    requiresConfirmation: false,
  });
  const [showAddToolkit, setShowAddToolkit] = useState(false);
  const [newToolkit, setNewToolkit] = useState<Omit<APIConfig, 'id'>>({
    name: '',
    url: '',
    method: 'GET',
    authType: 'NONE',
    requiresConfirmation: false,
  });

  useEffect(() => {
    loadAgentConfig();
  }, []);

  useEffect(() => {
    if (agent) {
      setMode(agent.mode);
      setName(agent.name);
      setDescription(agent.description || '');
      setSystemPrompt(agent.systemPrompt);
      if (agent.apiConfig) {
        setApiConfig(agent.apiConfig);
      }
    }
  }, [agent]);

  const loadAgentConfig = async () => {
    setLoading(true);
    const config = await getAgentConfig('agent-001');
    setAgent(config);
    setLoading(false);
  };

  const handleModeChange = async (newMode: AgentMode) => {
    setMode(newMode);
    if (agent) {
      await updateAgentConfig({ id: agent.id, mode: newMode });
      await loadAgentConfig();
    }
  };

  const handleSave = async () => {
    if (!agent) return;
    
    await updateAgentConfig({
      id: agent.id,
      name,
      description,
      systemPrompt,
      mode,
      apiConfig: mode === 'workflow' ? apiConfig : undefined,
    });
    
    await loadAgentConfig();
    alert('配置保存成功');
  };

  const handleAddToolkit = async () => {
    if (!agent) return;
    
    await createToolkit(agent.id, newToolkit);
    await loadAgentConfig();
    setNewToolkit({
      name: '',
      url: '',
      method: 'GET',
      authType: 'NONE',
      requiresConfirmation: false,
    });
    setShowAddToolkit(false);
  };

  const handleDeleteToolkit = async (toolkitId: string) => {
    if (!agent) return;
    
    await deleteToolkit(agent.id, toolkitId);
    await loadAgentConfig();
  };

  if (loading) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      <Sidebar activeView="admin" />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="max-w-4xl mx-auto p-6">
            <div className="flex items-center gap-2 mb-6 text-sm text-gray-600">
              <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                <Home className="w-4 h-4" />
                <span>智能体应用</span>
              </button>
              <ChevronRight className="w-4 h-4" />
              <span className="hover:text-blue-600 cursor-pointer transition-colors">智能体管理</span>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-800 font-medium">手工添加智能体</span>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h1 className="text-xl font-bold text-gray-800">智能体配置</h1>
                <p className="text-sm text-gray-500 mt-1">管理智能体的运行模式和 API 配置</p>
              </div>

              <div className="p-6 space-y-8">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-blue-600" />
                    基本信息
                  </h2>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">智能体名称</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">智能体标签</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="输入标签"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">能力描述</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      placeholder="请输入智能体的能力描述..."
                    />
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Bot className="w-5 h-5 text-blue-600" />
                    运行模式
                  </h2>
                  <AgentModeSwitch mode={mode} onChange={handleModeChange} />
                </div>



                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">
                      {mode === 'workflow' ? 'API 配置' : '工具集成'}
                    </h2>
                    {mode === 'react' && (
                      <button
                        onClick={() => setShowAddToolkit(!showAddToolkit)}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        添加工具
                      </button>
                    )}
                  </div>

                  {mode === 'workflow' ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">API 名称</label>
                        <input
                          type="text"
                          value={apiConfig.name}
                          onChange={(e) => setApiConfig({ ...apiConfig, name: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">API 地址</label>
                        <input
                          type="text"
                          value={apiConfig.url}
                          onChange={(e) => setApiConfig({ ...apiConfig, url: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">请求方法</label>
                        <select
                          value={apiConfig.method}
                          onChange={(e) => setApiConfig({ ...apiConfig, method: e.target.value as APIConfig['method'] })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="GET">GET</option>
                          <option value="POST">POST</option>
                          <option value="PUT">PUT</option>
                          <option value="DELETE">DELETE</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">认证类型</label>
                        <div className="flex gap-4">
                          {(['API_KEY', 'BEARER_TOKEN', 'NONE'] as const).map((type) => (
                            <label key={type} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="auth-type"
                                value={type}
                                checked={apiConfig.authType === type}
                                onChange={(e) => setApiConfig({ ...apiConfig, authType: e.target.value as APIConfig['authType'] })}
                                className="w-4 h-4 text-blue-600 border-gray-300"
                              />
                              <span className="text-sm text-gray-700">{type.replace('_', ' ')}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {(apiConfig.authType === 'API_KEY' || apiConfig.authType === 'BEARER_TOKEN') && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">认证密钥</label>
                          <input
                            type="password"
                            value={apiConfig.authKey || ''}
                            onChange={(e) => setApiConfig({ ...apiConfig, authKey: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      {showAddToolkit && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">工具名称</label>
                              <input
                                type="text"
                                value={newToolkit.name}
                                onChange={(e) => setNewToolkit({ ...newToolkit, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">API 地址</label>
                              <input
                                type="text"
                                value={newToolkit.url}
                                onChange={(e) => setNewToolkit({ ...newToolkit, url: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">请求方法</label>
                              <select
                                value={newToolkit.method}
                                onChange={(e) => setNewToolkit({ ...newToolkit, method: e.target.value as APIConfig['method'] })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              >
                                <option value="GET">GET</option>
                                <option value="POST">POST</option>
                                <option value="PUT">PUT</option>
                                <option value="DELETE">DELETE</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">认证类型</label>
                              <select
                                value={newToolkit.authType}
                                onChange={(e) => setNewToolkit({ ...newToolkit, authType: e.target.value as APIConfig['authType'] })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              >
                                <option value="NONE">NONE</option>
                                <option value="API_KEY">API_KEY</option>
                                <option value="BEARER_TOKEN">BEARER_TOKEN</option>
                              </select>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="requires-confirmation"
                              checked={newToolkit.requiresConfirmation}
                              onChange={(e) => setNewToolkit({ ...newToolkit, requiresConfirmation: e.target.checked })}
                              className="w-4 h-4 text-blue-600 border-gray-300"
                            />
                            <label htmlFor="requires-confirmation" className="flex items-center gap-1 text-sm text-gray-700">
                              <Lock className="w-3 h-3" />
                              调用前需要人工确认
                            </label>
                          </div>
                          <div className="mt-3 flex gap-2">
                            <button
                              onClick={handleAddToolkit}
                              className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                              确认添加
                            </button>
                            <button
                              onClick={() => setShowAddToolkit(false)}
                              className="px-4 py-1.5 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            >
                              取消
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        {agent?.toolkits.map((toolkit) => (
                          <div key={toolkit.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-800">{toolkit.name}</span>
                                {toolkit.requiresConfirmation && (
                                  <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">
                                    <Lock className="w-3 h-3" />
                                    需要确认
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500">{toolkit.url}</p>
                            </div>
                            <button
                              onClick={() => handleDeleteToolkit(toolkit.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border-t border-gray-200 px-6 py-4 sticky bottom-0">
          <div className="max-w-4xl mx-auto flex items-center justify-end gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
              接口测试
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              直接保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}