import React from 'react';
import { GitBranch, PlusCircle, SkipForward, CheckCircle2, AlertCircle } from 'lucide-react';
import { Step } from './StepCard';

interface ExecutionTraceProps {
  originalSteps: Step[];
  executedSteps: Step[];
  adjustments?: string[];
}

export default function ExecutionTrace({ originalSteps, executedSteps, adjustments = [] }: ExecutionTraceProps) {
  const completedCount = executedSteps.filter(s => s.status === 'completed').length;
  const userAddedCount = executedSteps.filter(s => s.isUserAdded).length;
  const skippedCount = executedSteps.filter(s => s.status === 'skipped').length;

  return (
    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-100">
      <div className="flex items-center gap-2 mb-4">
        <GitBranch className="w-5 h-5 text-purple-600" />
        <h4 className="font-semibold text-gray-800">执行路径追溯</h4>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-white rounded-lg p-3 border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">📋</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">{originalSteps.length}</div>
          <div className="text-xs text-gray-500">原始计划步骤</div>
        </div>

        <div className="bg-white rounded-lg p-3 border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-800">{completedCount}</div>
          <div className="text-xs text-gray-500">实际执行步骤</div>
        </div>

        <div className="bg-white rounded-lg p-3 border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <PlusCircle className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-gray-800">{userAddedCount}</div>
          <div className="text-xs text-gray-500">用户手动添加</div>
        </div>

        <div className="bg-white rounded-lg p-3 border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <SkipForward className="w-4 h-4 text-gray-500" />
          </div>
          <div className="text-2xl font-bold text-gray-800">{skippedCount}</div>
          <div className="text-xs text-gray-500">跳过步骤</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs text-gray-500 font-medium mb-2">动态调整情况</div>
        {adjustments.length > 0 ? (
          adjustments.map((adjustment, index) => (
            <div key={index} className="flex items-center gap-2 text-sm bg-yellow-50 px-3 py-2 rounded-lg">
              <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
              <span className="text-gray-700">{adjustment}</span>
            </div>
          ))
        ) : executedSteps.length === 0 ? (
          <p className="text-sm text-gray-400">暂无执行记录</p>
        ) : (
          <p className="text-sm text-gray-500">执行过程无动态调整</p>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-purple-100">
        <div className="text-xs text-gray-500 font-medium mb-2">执行步骤详情</div>
        <div className="space-y-2">
          {executedSteps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${
                step.status === 'completed' ? 'bg-green-500' :
                step.status === 'skipped' ? 'bg-gray-400' :
                'bg-gray-300'
              }`} />
              <span className="text-gray-600">{step.apiName}</span>
              {step.isUserAdded && (
                <span className="text-xs px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded">用户添加</span>
              )}
              {step.status === 'skipped' && (
                <span className="text-xs px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded">已跳过</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}