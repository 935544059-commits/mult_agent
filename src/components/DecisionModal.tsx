import React from 'react';
import { X, AlertCircle, PlusCircle, SkipForward, CheckCircle } from 'lucide-react';

export type DecisionType = 'suggest-add' | 'suggest-skip' | 'confirm-continue';

interface DecisionModalProps {
  isOpen: boolean;
  type: DecisionType;
  apiName?: string;
  stepName?: string;
  reason?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DecisionModal({
  isOpen,
  type,
  apiName,
  stepName,
  reason,
  onConfirm,
  onCancel
}: DecisionModalProps) {
  if (!isOpen) return null;

  const getContent = () => {
    switch (type) {
      case 'suggest-add':
        return {
          icon: <PlusCircle className="w-10 h-10 text-blue-600" />,
          title: '发现新线索',
          message: `根据当前执行结果，建议追加执行「${apiName}」以获取更多信息。`,
          confirmBtn: '确认追加',
          cancelBtn: '跳过'
        };
      case 'suggest-skip':
        return {
          icon: <SkipForward className="w-10 h-10 text-yellow-600" />,
          title: '已定位根因',
          message: `${reason || '分析结果显示已找到问题根源'}，建议跳过后续 ${stepName} 步骤，直接进入汇总环节。`,
          confirmBtn: '确认跳过',
          cancelBtn: '继续执行'
        };
      case 'confirm-continue':
        return {
          icon: <AlertCircle className="w-10 h-10 text-orange-600" />,
          title: '步骤执行异常',
          message: `${reason || '当前步骤执行出现异常'}，是否继续执行后续步骤？`,
          confirmBtn: '继续执行',
          cancelBtn: '停止执行'
        };
      default:
        return null;
    }
  };

  const content = getContent();
  if (!content) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4 transform transition-all">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="p-4 bg-gray-100 rounded-full mb-4">
            {content.icon}
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{content.title}</h3>
          <p className="text-gray-600 mb-6">{content.message}</p>

          <div className="flex gap-3 w-full">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {content.cancelBtn}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors ${
                type === 'suggest-add' ? 'bg-blue-500' :
                type === 'suggest-skip' ? 'bg-yellow-500' :
                'bg-green-500'
              }`}
            >
              {content.confirmBtn}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}