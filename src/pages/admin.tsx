import React, { useState } from 'react';
import { Bot, MessageCircle, Settings, Save, Upload, Plus, ChevronRight } from 'lucide-react';

export default function AdminPage() {
  const [formData, setFormData] = useState({
    name: '',
    tags: ['标签1'],
    newTag: '',
    description: '',
    pollingFrequency: '每1h',
    agentType: 'workflow',
    maasPlatform: 'zhijia',
    apiName: '',
    apiUrl: '',
    apiDescription: '',
    authType: 'API_KEY',
    apiKey: '',
    bearerToken: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const pollingOptions = ['每15m', '每30m', '每1h', '每2h', '每6h', '每12h', '每天'];
  const maasOptions = [
    { value: 'zhijia', label: '知+平台' },
    { value: 'jiutian', label: '九天平台' },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = '请输入智能体名称';
    if (!formData.description.trim()) newErrors.description = '请输入能力描述';
    if (!formData.apiName.trim()) newErrors.apiName = '请输入API名称';
    if (!formData.apiUrl.trim()) newErrors.apiUrl = '请输入API地址';
    if (formData.authType !== 'NONE' && !formData[formData.authType === 'API_KEY' ? 'apiKey' : 'bearerToken'].trim()) {
      newErrors.authKey = formData.authType === 'API_KEY' ? '请输入API Key' : '请输入Bearer Token';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddTag = () => {
    if (formData.newTag.trim() && !formData.tags.includes(formData.newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, formData.newTag.trim()],
        newTag: '',
      }));
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }));
  };

  const handleSave = () => {
    if (validateForm()) {
      alert('配置保存成功');
    }
  };

  const handleTest = () => {
    if (validateForm()) {
      alert('接口测试功能已触发');
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-blue-600" />
            <span className="font-bold text-gray-800">智能体应用</span>
          </div>
        </div>
        <nav className="flex-1 p-2">
          <button onClick={() => window.location.href = '/chat'} className="w-full flex items-center gap-2 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50">
            <MessageCircle className="w-5 h-5" />
            <span>用户视图</span>
          </button>
          <button className="w-full flex items-center gap-2 px-4 py-3 rounded-lg bg-blue-50 text-blue-600">
            <Settings className="w-5 h-5" />
            <span>后台管理</span>
          </button>
        </nav>
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6">
            <div className="flex items-center gap-2 mb-6 text-sm text-gray-600">
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-800 font-medium">手工添加智能体</span>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h1 className="text-xl font-bold text-gray-800">手工添加智能体</h1>
              </div>

              <div className="p-6">
                <div className="flex gap-6 mb-8">
                  <div className="w-32 h-32 flex-shrink-0">
                    <div className="w-full h-full bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-colors">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-xs text-gray-500 text-center">点击上传</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 text-center">
                      图片格式支持<br />大小不超过2M
                    </p>
                  </div>

                  <div className="flex-1">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          智能体名称 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="请输入"
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">智能体标签</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={formData.newTag}
                            onChange={(e) => setFormData(prev => ({ ...prev, newTag: e.target.value }))}
                            placeholder="输入标签"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                          />
                          <button
                            onClick={handleAddTag}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-1"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        {formData.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {formData.tags.map(tag => (
                              <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                                {tag}
                                <button onClick={() => handleRemoveTag(tag)} className="hover:text-red-500">×</button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        能力描述 <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value.slice(0, 100) }))}
                        rows={3}
                        placeholder="该字段用于语义画像匹配，请仔细输入能力特征和业务定义。建议描述核心实体（如：IP查询、故障排查）及操作意图（如：诊断、查询、汇总）"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      <div className="text-right">
                        <span className="text-xs text-gray-400">{formData.description.length}/100</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-1 h-5 bg-blue-600 rounded" />
                    <h2 className="text-lg font-semibold text-gray-800">API 基本信息配置</h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">API 轮询频率</label>
                      <select
                        value={formData.pollingFrequency}
                        onChange={(e) => setFormData(prev => ({ ...prev, pollingFrequency: e.target.value }))}
                        className="w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {pollingOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        智能体类型 <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="agentType"
                            value="workflow"
                            checked={formData.agentType === 'workflow'}
                            onChange={(e) => setFormData(prev => ({ ...prev, agentType: e.target.value }))}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">工作流智能体</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="agentType"
                            value="react"
                            checked={formData.agentType === 'react'}
                            onChange={(e) => setFormData(prev => ({ ...prev, agentType: e.target.value }))}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">ReAct 智能体</span>
                        </label>
                      </div>

                      {formData.agentType === 'workflow' && (
                        <div className="mt-4 pl-6">
                          <label className="block text-sm font-medium text-gray-700 mb-2">MAAS 平台</label>
                          <div className="flex gap-6">
                            {maasOptions.map(opt => (
                              <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="maasPlatform"
                                  value={opt.value}
                                  checked={formData.maasPlatform === opt.value}
                                  onChange={(e) => setFormData(prev => ({ ...prev, maasPlatform: e.target.value }))}
                                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">{opt.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        API 名称 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.apiName}
                        onChange={(e) => setFormData(prev => ({ ...prev, apiName: e.target.value }))}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.apiName ? 'border-red-500' : 'border-gray-300'}`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        API 地址 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.apiUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, apiUrl: e.target.value }))}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.apiUrl ? 'border-red-500' : 'border-gray-300'}`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">API 描述</label>
                      <textarea
                        value={formData.apiDescription}
                        onChange={(e) => setFormData(prev => ({ ...prev, apiDescription: e.target.value.slice(0, 200) }))}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      />
                      <div className="text-right">
                        <span className="text-xs text-gray-400">{formData.apiDescription.length}/200</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        认证类型 <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="authType"
                            value="API_KEY"
                            checked={formData.authType === 'API_KEY'}
                            onChange={(e) => setFormData(prev => ({ ...prev, authType: e.target.value }))}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">API_KEY</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="authType"
                            value="BEARER_TOKEN"
                            checked={formData.authType === 'BEARER_TOKEN'}
                            onChange={(e) => setFormData(prev => ({ ...prev, authType: e.target.value }))}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">BEARER_TOKEN</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="authType"
                            value="NONE"
                            checked={formData.authType === 'NONE'}
                            onChange={(e) => setFormData(prev => ({ ...prev, authType: e.target.value }))}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">NONE</span>
                        </label>
                      </div>
                    </div>

                    {(formData.authType === 'API_KEY' || formData.authType === 'BEARER_TOKEN') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <span className="text-red-500">*</span> {formData.authType === 'API_KEY' ? 'API_KEY' : 'BEARER_TOKEN'}
                        </label>
                        <input
                          type="password"
                          value={formData.authType === 'API_KEY' ? formData.apiKey : formData.bearerToken}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            ...(formData.authType === 'API_KEY' ? { apiKey: e.target.value } : { bearerToken: e.target.value })
                          }))}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.authKey ? 'border-red-500' : 'border-gray-300'}`}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border-t border-gray-200 px-6 py-4 shrink-0">
          <div className="max-w-4xl mx-auto flex items-center justify-end gap-4">
            <button onClick={handleSave} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
              直接保存
            </button>
            <button onClick={handleTest} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              接口测试
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}