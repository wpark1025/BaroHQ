'use client';

import { useState } from 'react';
import { GripVertical, Plus, Bug, BookOpen, CheckSquare, Layers, AlertTriangle } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { TaskStatus, TaskType, TaskPriority } from '@/lib/types';

const COLUMNS: { status: TaskStatus; label: string; color: string }[] = [
  { status: TaskStatus.Backlog, label: 'Backlog', color: 'border-slate-500' },
  { status: TaskStatus.Todo, label: 'To Do', color: 'border-blue-500' },
  { status: TaskStatus.InProgress, label: 'In Progress', color: 'border-yellow-500' },
  { status: TaskStatus.InReview, label: 'In Review', color: 'border-purple-500' },
  { status: TaskStatus.Done, label: 'Done', color: 'border-green-500' },
];

const TYPE_ICONS: Record<string, React.ReactNode> = {
  [TaskType.Epic]: <Layers size={12} className="text-purple-400" />,
  [TaskType.Story]: <BookOpen size={12} className="text-green-400" />,
  [TaskType.Task]: <CheckSquare size={12} className="text-blue-400" />,
  [TaskType.Bug]: <Bug size={12} className="text-red-400" />,
  [TaskType.Subtask]: <CheckSquare size={10} className="text-slate-400" />,
};

const PRIORITY_COLORS: Record<string, string> = {
  [TaskPriority.Critical]: 'bg-red-500/20 text-red-400',
  [TaskPriority.High]: 'bg-orange-500/20 text-orange-400',
  [TaskPriority.Medium]: 'bg-yellow-500/20 text-yellow-400',
  [TaskPriority.Low]: 'bg-slate-500/20 text-slate-400',
  [TaskPriority.None]: 'bg-slate-800 text-slate-500',
};

interface ProjectBoardProps {
  projectId: string;
}

export function ProjectBoard({ projectId }: ProjectBoardProps) {
  const tasks = useProjectStore((s) => s.getTasksByProject(projectId));
  const updateTask = useProjectStore((s) => s.updateTask);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleDragStart = (taskId: string) => {
    setDraggedId(taskId);
  };

  const handleDrop = (status: TaskStatus) => {
    if (draggedId) {
      updateTask(draggedId, { status });
      setDraggedId(null);
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {COLUMNS.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.status);
        return (
          <div
            key={col.status}
            className="flex-shrink-0 w-72"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(col.status)}
          >
            {/* Column header */}
            <div className={`flex items-center justify-between mb-3 pb-2 border-b-2 ${col.color}`}>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide">{col.label}</h3>
                <span className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
                  {columnTasks.length}
                </span>
              </div>
              <button className="text-slate-500 hover:text-slate-300 transition-colors">
                <Plus size={14} />
              </button>
            </div>

            {/* Cards */}
            <div className="space-y-2">
              {columnTasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(task.id)}
                  className={`bg-slate-900 border border-slate-800 rounded-lg p-3 cursor-grab hover:border-slate-700 transition-all ${
                    draggedId === task.id ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <GripVertical size={12} className="text-slate-600 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        {TYPE_ICONS[task.type]}
                        <span className="text-[10px] text-slate-500">{task.id}</span>
                      </div>
                      <p className="text-sm text-slate-200 leading-snug">{task.title}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 text-[10px] rounded ${PRIORITY_COLORS[task.priority]}`}>
                        {task.priority}
                      </span>
                      {task.labels.slice(0, 1).map((label) => (
                        <span key={label} className="px-1.5 py-0.5 bg-slate-800 text-slate-500 text-[10px] rounded">
                          {label}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      {task.storyPoints > 0 && (
                        <span className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
                          {task.storyPoints}pt
                        </span>
                      )}
                      {task.assignee && (
                        <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center">
                          <span className="text-[8px] text-slate-400">
                            {task.assignee[0].toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {task.autoCreated && (
                    <div className="flex items-center gap-1 mt-2 pt-2 border-t border-slate-800">
                      <AlertTriangle size={10} className="text-amber-400" />
                      <span className="text-[10px] text-amber-400">Auto-created</span>
                    </div>
                  )}
                </div>
              ))}
              {columnTasks.length === 0 && (
                <div className="py-8 text-center">
                  <p className="text-xs text-slate-600">No tasks</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
