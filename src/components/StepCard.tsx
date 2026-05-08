import React from 'react';
import { X, GripVertical, CheckCircle2, AlertCircle, Loader2, Wifi, Database, Cpu, Shield, FileSearch, Terminal } from 'lucide-react';

export type StepStatus = 'pending' | 'running' | 'completed' | 'skipped' | 'failed';

export interface Step {
  id: string;
  apiId: string;
  apiName: string;
  description: string;
  status: StepStatus;
  result?: string;
  isUserAdded?: boolean;
  isSkipped?: boolean;
}

const iconMap: Record<string, React.ReactNode> = {
  'port-scan': <Wifi className="w-4 h-4" />,
  'protocol-analyze': <Database className="w-4 h-4" />,
  'cpu-monitor': <Cpu className="w-4 h-4" />,
  'security-check': <Shield className="w-4 h-4" />,
  'log-query': <FileSearch className="w-4 h-4" />,
  'command-exec': <Terminal className="w-4 h-4" />
};

interface StepCardProps {
  step: Step;
  index: number;
  onDelete: (id: string) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isDragging?: boolean;
  showActions?: boolean;
}

export default function StepCard({ step, index, onDelete, showActions = true }: StepCardProps) {
  const getStatusStyles = () => {
    switch (step.status) {
      case 'completed':
        return 'border-green-300 bg-green-50';
      case 'running':
        return 'border-blue-300 bg-blue-50';
      case 'failed':
        return 'border-red-300 bg-red-50';
      case 'skipped':
        return 'border-gray-300 bg-gray-100 opacity-60';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  const getStatusIcon = () => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'running':
        return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'skipped':
        return <span className="w-4 h-4 flex items-center justify-center text-gray-400">✕</span>;
      default:
        return <span className="w-4 h-4 flex items-center justify-center text-gray-400">{index + 1}</span>;
    }
  };

  const getStatusText = () => {
    switch (step.status) {
      case 'completed':
        return '已完成';
      case 'running':
        return '执行中';
      case 'failed':
        return '失败';
      case 'skipped':
        return '已跳过';
      default:
        return '待执行';
    }
  };

  return (
    <div
      className={`group flex items-start gap-3 p-4 rounded-xl border-2 transition-all hover:shadow-md ${getStatusStyles()}`}
    >
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-gray-100 rounded-lg cursor-grab active:cursor-grabbing">
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>
        <div className="p-1.5 bg-white rounded-lg border border-gray-200 text-gray-600">
          {iconMap[step.apiId] || <Terminal className="w-4 h-4" />}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-800">{step.apiName}</span>
            {step.isUserAdded && (
              <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full">用户添加</span>
            )}
            {step.isSkipped && (
              <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full">已跳过</span>
            )}
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            step.status === 'completed' ? 'bg-green-100 text-green-700' :
            step.status === 'running' ? 'bg-blue-100 text-blue-700' :
            step.status === 'failed' ? 'bg-red-100 text-red-700' :
            step.status === 'skipped' ? 'bg-gray-200 text-gray-600' :
            'bg-gray-100 text-gray-500'
          }`}>
            {getStatusText()}
          </span>
        </div>
        <p className="text-sm text-gray-500 mb-2">{step.description}</p>
        {step.result && (
          <div className="text-sm text-gray-600 bg-white/80 rounded-lg p-2 border border-gray-200">
            <span className="font-medium text-gray-700">执行结果：</span>
            {step.result}
          </div>
        )}
      </div>

      {showActions && step.status === 'pending' && (
        <button
          onClick={() => onDelete(step.id)}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          title="删除步骤"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <div className="flex-shrink-0 mt-1">
        {getStatusIcon()}
      </div>
    </div>
  );
}