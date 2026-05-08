import React from 'react';
import { Workflow, GitBranch } from 'lucide-react';
import { AgentMode } from '@/types';

interface AgentModeSwitchProps {
  mode: AgentMode;
  onChange: (mode: AgentMode) => void;
}

export const AgentModeSwitch: React.FC<AgentModeSwitchProps> = ({ mode, onChange }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <h3 className="text-sm font-medium text-gray-700 mb-3">运行模式</h3>
      <div className="flex gap-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            name="agent-mode"
            value="workflow"
            checked={mode === 'workflow'}
            onChange={() => onChange('workflow')}
            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
          />
          <div className="flex items-center gap-2">
            <Workflow className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">工作流模式</span>
          </div>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            name="agent-mode"
            value="react"
            checked={mode === 'react'}
            onChange={() => onChange('react')}
            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
          />
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">ReAct 模式</span>
          </div>
        </label>
      </div>
      <p className="mt-2 text-xs text-gray-500">
        {mode === 'workflow' 
          ? '工作流模式：仅支持配置一个 API 接口，同步处理请求' 
          : 'ReAct 模式：支持添加多个工具集，异步执行并展示思考链路'}
      </p>
    </div>
  );
};