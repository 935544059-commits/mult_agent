import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, ChevronRight } from 'lucide-react';

export interface PlannedStep {
  id: string;
  thought: string;
  action: string;
  actionParams?: Record<string, unknown>;
}

interface PlannedStepsProps {
  steps: PlannedStep[];
  onStepsChange: (steps: PlannedStep[]) => void;
  onConfirm?: () => void;
}

function SortableItem({ step, onDelete }: { step: PlannedStep; onDelete: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-colors group"
    >
      <button
        {...attributes}
        {...listeners}
        className="p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-5 h-5" />
      </button>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
            步骤 {step.id.split('-')[1]}
          </span>
          <span className="text-xs text-gray-500 truncate">
            {step.action}
          </span>
        </div>
        <p className="text-sm text-gray-600 truncate">{step.thought}</p>
        {step.actionParams && (
          <pre className="mt-1 text-xs text-gray-500 bg-gray-50 p-2 rounded overflow-x-auto">
            {JSON.stringify(step.actionParams, null, 2)}
          </pre>
        )}
      </div>

      <button
        onClick={onDelete}
        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
        title="删除步骤"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

export function PlannedSteps({ steps, onStepsChange, onConfirm }: PlannedStepsProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = steps.findIndex((s) => s.id === active.id);
      const newIndex = steps.findIndex((s) => s.id === over.id);
      onStepsChange(arrayMove(steps, oldIndex, newIndex));
    }
  };

  const handleDelete = (stepId: string) => {
    onStepsChange(steps.filter((s) => s.id !== stepId));
  };

  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <span className="text-blue-600 font-semibold">📋</span>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">执行计划</h3>
          <p className="text-sm text-gray-500">请确认计划步骤，可拖拽调整顺序或删除</p>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={steps.map((s) => s.id)} strategy={rectSortingStrategy}>
          <div className="space-y-2 mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="relative">
                <SortableItem step={step} onDelete={() => handleDelete(step.id)} />
                {index < steps.length - 1 && (
                  <div className="absolute left-[18px] top-full w-0.5 h-2 bg-gray-300" />
                )}
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {steps.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p>所有步骤已被删除</p>
          <p className="text-sm">请至少保留一个步骤</p>
        </div>
      ) : (
        <button
          onClick={onConfirm}
          disabled={!onConfirm}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-5 h-5" />
          确认并开始执行
        </button>
      )}
    </div>
  );
}