'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GripVertical, Bug, BookOpen, CheckSquare, Layers, AlertTriangle } from 'lucide-react';
import { useTaskStore } from '@/store/taskStore';
import { TaskStatus, TaskType, TaskPriority } from '@/lib/types';

const COLUMNS: { status: TaskStatus; label: string; dotColor: string }[] = [
  { status: TaskStatus.Backlog, label: 'Backlog', dotColor: 'bg-slate-400' },
  { status: TaskStatus.Todo, label: 'To Do', dotColor: 'bg-blue-400' },
  { status: TaskStatus.InProgress, label: 'In Progress', dotColor: 'bg-yellow-400' },
  { status: TaskStatus.InReview, label: 'In Review', dotColor: 'bg-purple-400' },
  { status: TaskStatus.Done, label: 'Done', dotColor: 'bg-green-400' },
];

const TYPE_ICONS: Record<string, React.ReactNode> = {
  [TaskType.Epic]: <Layers size={12} className="text-purple-400" />,
  [TaskType.Story]: <BookOpen size={12} className="text-green-400" />,
  [TaskType.Task]: <CheckSquare size={12} className="text-blue-400" />,
  [TaskType.Bug]: <Bug size={12} className="text-red-400" />,
  [TaskType.Subtask]: <CheckSquare size={10} className="text-slate-400" />,
};

const PRIORITY_BADGE: Record<string, string> = {
  [TaskPriority.Critical]: 'bg-red-500/20 text-red-400 border-red-500/30',
  [TaskPriority.High]: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  [TaskPriority.Medium]: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  [TaskPriority.Low]: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  [TaskPriority.None]: 'bg-slate-800 text-slate-500 border-slate-700',
};

export function TaskBoard() {
  const router = useRouter();
  const filteredTasks = useTaskStore((s) => s.getFilteredTasks());
  const updateTask = useTaskStore((s) => s.updateTask);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleDrop = (status: TaskStatus) => {
    if (draggedId) {
      updateTask(draggedId, { status, updatedAt: new Date().toISOString() });
      setDraggedId(null);
    }
  };

  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {COLUMNS.map((col) => {
        const columnTasks = filteredTasks.filter((t) => t.status === col.status);
        return (
          <div
            key={col.status}
            className="flex-shrink-0 w-72"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(col.status)}
          >
            <div className="flex items-center gap-2 mb-3 px-1">
              <span className={`w-2 h-2 rounded-full ${col.dotColor}`} />
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide">{col.label}</h3>
              <span className="text-[10px] text-slate-500 bg-slate-800/80 px-1.5 py-0.5 rounded-full">
                {columnTasks.length}
              </span>
            </div>

            <div className="space-y-2 min-h-[200px]">
              {columnTasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => setDraggedId(task.id)}
                  onClick={() => router.push(`/tasks/${task.id}`)}
                  className={`bg-slate-900 border border-slate-800 rounded-lg p-3 cursor-pointer hover:border-slate-700 transition-all group ${
                    draggedId === task.id ? 'opacity-40 scale-95' : ''
                  }`}
                >
                  {/* Type + ID */}
                  <div className="flex items-center gap-1.5 mb-1.5">
                    {TYPE_ICONS[task.type]}
                    <span className="text-[10px] text-slate-500 font-mono">{task.id}</span>
                  </div>

                  {/* Title */}
                  <p className="text-sm text-slate-200 leading-snug mb-2.5 group-hover:text-blue-300 transition-colors">
                    {task.title}
                  </p>

                  {/* Labels */}
                  {task.labels.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2.5">
                      {task.labels.slice(0, 2).map((label) => (
                        <span key={label} className="px-1.5 py-0.5 bg-slate-800 text-slate-500 text-[10px] rounded">
                          {label}
                        </span>
                      ))}
                      {task.labels.length > 2 && (
                        <span className="text-[10px] text-slate-600">+{task.labels.length - 2}</span>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <span className={`px-1.5 py-0.5 text-[10px] rounded border ${PRIORITY_BADGE[task.priority]}`}>
                      {task.priority}
                    </span>
                    <div className="flex items-center gap-2">
                      {task.storyPoints > 0 && (
                        <span className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded-full font-mono">
                          {task.storyPoints}
                        </span>
                      )}
                      {task.assignee && (
                        <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                          <span className="text-[8px] text-blue-400 font-medium">
                            {task.assignee.replace('agent-', '').charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {task.autoCreated && (
                    <div className="flex items-center gap-1 mt-2 pt-2 border-t border-slate-800/50">
                      <AlertTriangle size={10} className="text-amber-400" />
                      <span className="text-[10px] text-amber-400/80">Auto-generated</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
