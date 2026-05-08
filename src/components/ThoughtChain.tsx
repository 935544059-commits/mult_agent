import React, { useState, useCallback } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Lightbulb, 
  Play, 
  Eye, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Copy,
  RotateCcw
} from 'lucide-react';
import { ReActStep, TaskStatus } from '@/types';
import { SolutionReportCard } from './SolutionReportCard';
import { PlannedSteps, PlannedStep } from './PlannedSteps';

interface ThoughtChainProps {
  steps: ReActStep[];
  status: TaskStatus;
  finalAnswer?: string;
  requiresAction?: {
    action: string;
    actionParams: Record<string, unknown>;
    apiConfig: {
      name: string;
      description?: string;
    };
  };
  onConfirm?: (confirmed: boolean) => void;
  onRetry?: () => void;
  isPlanning?: boolean;
  plannedSteps?: PlannedStep[];
  onConfirmPlan?: () => void;
}

const MAX_LOG_LENGTH = 200;

interface ExpandedLogs {
  [key: string]: boolean;
}

export const ThoughtChain: React.FC<ThoughtChainProps> = ({
  steps,
  status,
  finalAnswer,
  requiresAction,
  onConfirm,
  onRetry,
  isPlanning = false,
  plannedSteps = [],
  onConfirmPlan,
}) => {
  const [expanded, setExpanded] = useState(true);
  const [expandedLogs, setExpandedLogs] = useState<ExpandedLogs>({});
  const [localPlannedSteps, setLocalPlannedSteps] = useState<PlannedStep[]>(plannedSteps);

  const toggleLogExpand = useCallback((stepId: string) => {
    setExpandedLogs(prev => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
  }, []);

  const copyToClipboard = useCallback(async () => {
    if (!finalAnswer) return;
    try {
      await navigator.clipboard.writeText(finalAnswer);
      alert('已复制到剪贴板');
    } catch (err) {
      console.error('复制失败:', err);
    }
  }, [finalAnswer]);

  const statusColors = {
    PENDING: 'text-gray-500',
    RUNNING: 'text-blue-500',
    WAITING_USER: 'text-yellow-500',
    COMPLETED: 'text-green-500',
    FAILED: 'text-red-500',
  };

  const statusLabels = {
    PENDING: '等待中',
    RUNNING: '执行中',
    WAITING_USER: '等待确认',
    COMPLETED: '已完成',
    FAILED: '失败',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${status === 'RUNNING' ? 'bg-blue-500 animate-pulse' : status === 'COMPLETED' ? 'bg-green-500' : status === 'WAITING_USER' ? 'bg-yellow-500 animate-pulse' : status === 'FAILED' ? 'bg-red-500' : 'bg-gray-300'}`} />
          <span className="font-medium text-gray-700">思考链路</span>
          <span className={`text-xs px-2 py-0.5 rounded-full bg-gray-100 ${statusColors[status]}`}>
            {statusLabels[status]}
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4">
          {isPlanning && (
            <PlannedSteps
              steps={localPlannedSteps}
              onStepsChange={setLocalPlannedSteps}
              onConfirm={onConfirmPlan}
            />
          )}

          {!isPlanning && requiresAction && status === 'WAITING_USER' && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-yellow-800 mb-2">需要人工确认</h4>
                  <p className="text-sm text-yellow-700 mb-2">
                    即将调用 <span className="font-medium">{requiresAction.apiConfig.name}</span>
                    {requiresAction.apiConfig.description && (
                      <span> - {requiresAction.apiConfig.description}</span>
                    )}
                  </p>
                  <div className="bg-white p-3 rounded border border-yellow-200 mb-3">
                    <p className="text-xs text-gray-500 mb-1">调用参数：</p>
                    <pre className="text-sm text-yellow-800">{JSON.stringify(requiresAction.actionParams, null, 2)}</pre>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onConfirm?.(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      允许执行
                    </button>
                    <button
                      onClick={() => onConfirm?.(false)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      拒绝执行
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!isPlanning && (
            <div className="space-y-3">
              {steps.map((step, index) => (
              <div
                key={step.id}
                className="relative pl-6 pb-3 last:pb-0"
              >
                {index < steps.length - 1 && (
                  <div className="absolute left-1.5 top-4 bottom-0 w-0.5 bg-gray-200" />
                )}
                <div className="absolute left-0 top-0 w-3 h-3 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{index + 1}</span>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-start gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">思考</p>
                      <p className="text-sm text-gray-600 mt-0.5">{step.thought}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 mb-2">
                    <Play className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">行动：{step.action}</p>
                      {step.actionParams && (
                        <pre className="text-xs text-gray-500 mt-0.5 bg-white p-2 rounded border">
                          {JSON.stringify(step.actionParams, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Eye className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">观察</p>
                      {step.observation.length > MAX_LOG_LENGTH ? (
                        <div className="mt-0.5">
                          <div
                            className="bg-[#1e1e1e] text-[#d4d4d4] font-[Courier_New] text-xs rounded-lg overflow-hidden"
                            style={{
                              maxHeight: expandedLogs[step.id] ? 'none' : '120px'
                            }}
                          >
                            <pre className="p-3 whitespace-pre-wrap break-all">
                              {step.observation}
                            </pre>
                          </div>
                          <button
                            onClick={() => toggleLogExpand(step.id)}
                            className="mt-2 text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            {expandedLogs[step.id] ? (
                              <>
                                <ChevronUp className="w-3 h-3" />
                                收起日志
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-3 h-3" />
                                点击展开更多设备日志
                              </>
                            )}
                          </button>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600 mt-0.5 font-[Courier_New] text-xs">
                          {step.observation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}

          {!isPlanning && finalAnswer && status === 'COMPLETED' && (
            <>
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg relative">
                <div className="flex items-start justify-between">
                  <h4 className="font-medium text-green-800 mb-2">最终答案</h4>
                  <div className="flex gap-2">
                    <button
                      onClick={copyToClipboard}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-colors"
                      title="复制"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    {onRetry && (
                      <button
                        onClick={onRetry}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-colors"
                        title="重新执行"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-green-700 whitespace-pre-wrap">{finalAnswer}</p>
              </div>
              <SolutionReportCard steps={steps} content={finalAnswer} />
            </>
          )}
        </div>
      )}
    </div>
  );
};