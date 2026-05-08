import React, { useState, useCallback } from 'react';
import { Play, Plus, RefreshCw, Pause, Trash2 } from 'lucide-react';
import StepCard, { Step, StepStatus } from './StepCard';
import AtomicApiLibrary, { APIItem } from './AtomicApiLibrary';

export type ExecutionPhase = 'planning' | 'executing' | 'completed';

interface ExecutablePlanBoardProps {
  steps: Step[];
  phase: ExecutionPhase;
  currentStepIndex: number;
  onUpdateSteps: (steps: Step[]) => void;
  onStartExecution: () => void;
  onPauseExecution: () => void;
  onReset: () => void;
}

export default function ExecutablePlanBoard({
  steps,
  phase,
  currentStepIndex,
  onUpdateSteps,
  onStartExecution,
  onPauseExecution,
  onReset
}: ExecutablePlanBoardProps) {
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDeleteStep = (id: string) => {
    const newSteps = steps.filter(step => step.id !== id);
    onUpdateSteps(newSteps);
  };

  const handleAddStep = (api: APIItem) => {
    const newStep: Step = {
      id: `step-${Date.now()}`,
      apiId: api.id,
      apiName: api.name,
      description: api.description,
      status: 'pending',
      isUserAdded: true
    };
    onUpdateSteps([...steps, newStep]);
    setIsLibraryOpen(false);
  };

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newSteps = [...steps];
    const [draggedStep] = newSteps.splice(draggedIndex, 1);
    newSteps.splice(targetIndex, 0, draggedStep);
    onUpdateSteps(newSteps);

    setDraggedIndex(null);
    setDragOverIndex(null);
  }, [draggedIndex, steps, onUpdateSteps]);

  const getDisabledApiIds = () => {
    return steps.map(step => step.apiId);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-800">执行计划</h3>
            <p className="text-sm text-gray-500 mt-1">
              {phase === 'planning' && '拖拽调整步骤顺序，或从 API 库添加新步骤'}
              {phase === 'executing' && `正在执行第 ${currentStepIndex + 1} / ${steps.length} 步`}
              {phase === 'completed' && '执行完成'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {phase === 'planning' && (
              <>
                <button
                  onClick={() => setIsLibraryOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  添加步骤
                </button>
                <button
                  onClick={onReset}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  清空
                </button>
              </>
            )}
            {phase === 'executing' && (
              <button
                onClick={onPauseExecution}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                <Pause className="w-4 h-4" />
                暂停
              </button>
            )}
            {phase === 'planning' && steps.length > 0 && (
              <button
                onClick={onStartExecution}
                className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Play className="w-4 h-4" />
                开始执行
              </button>
            )}
            {phase === 'completed' && (
              <button
                onClick={onReset}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                重新执行
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 max-h-[500px] overflow-y-auto scrollbar-thin">
        {steps.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📋</div>
            <p className="text-gray-500">暂无执行步骤</p>
            <button
              onClick={() => setIsLibraryOpen(true)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              从 API 库添加步骤
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div
                key={step.id}
                draggable={phase === 'planning'}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                className={`transition-all duration-200 ${
                  draggedIndex === index ? 'opacity-50 scale-95' : ''
                } ${
                  dragOverIndex === index && draggedIndex !== index ? 'ring-2 ring-blue-400 ring-offset-2 rounded-xl' : ''
                } ${
                  phase === 'planning' ? 'cursor-grab active:cursor-grabbing' : ''
                }`}
              >
                <StepCard
                  step={step}
                  index={index}
                  onDelete={handleDeleteStep}
                  showActions={phase === 'planning'}
                  isDragging={currentStepIndex === index && phase === 'executing'}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <AtomicApiLibrary
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onAddStep={handleAddStep}
        disabledIds={getDisabledApiIds()}
      />
    </div>
  );
}