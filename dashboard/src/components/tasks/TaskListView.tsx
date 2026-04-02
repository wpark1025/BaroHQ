'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowUpDown, Bug, BookOpen, CheckSquare, Layers, MoreHorizontal,
} from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { Task, TaskType, TaskPriority, TaskStatus } from '@/lib/types';

const TYPE_ICONS: Record<string, React.ReactNode> = {
  [TaskType.Epic]: <Layers size={14} className="text-purple-400" />,
  [TaskType.Story]: <BookOpen size={14} className="text-green-400" />,
  [TaskType.Task]: <CheckSquare size={14} className="text-blue-400" />,
  [TaskType.Bug]: <Bug size={14} className="text-red-400" />,
  [TaskType.Subtask]: <CheckSquare size={12} className="text-slate-400" />,
};

const STATUS_DOT: Record<string, string> = {
  [TaskStatus.Backlog]: 'bg-slate-400',
  [TaskStatus.Todo]: 'bg-blue-400',
  [TaskStatus.InProgress]: 'bg-yellow-400',
  [TaskStatus.InReview]: 'bg-purple-400',
  [TaskStatus.Done]: 'bg-green-400',
  [TaskStatus.Cancelled]: 'bg-red-400',
};

const PRIORITY_COLOR: Record<string, string> = {
  [TaskPriority.Critical]: 'text-red-400',
  [TaskPriority.High]: 'text-orange-400',
  [TaskPriority.Medium]: 'text-yellow-400',
  [TaskPriority.Low]: 'text-slate-500',
  [TaskPriority.None]: 'text-slate-600',
};

type SortField = 'title' | 'status' | 'priority' | 'assignee' | 'storyPoints' | 'dueDate';

export function TaskListView() {
  const router = useRouter();
  const filteredTasks = useProjectStore((s) => s.getFilteredTasks());
  const updateTask = useProjectStore((s) => s.updateTask);
  const [sortField, setSortField] = useState<SortField>('priority');
  const [sortAsc, setSortAsc] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulk, setShowBulk] = useState(false);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3, none: 4 };
  const statusOrder: Record<string, number> = { backlog: 0, todo: 1, in_progress: 2, in_review: 3, done: 4, cancelled: 5 };

  const sorted = [...filteredTasks].sort((a, b) => {
    let cmp = 0;
    switch (sortField) {
      case 'title': cmp = a.title.localeCompare(b.title); break;
      case 'status': cmp = statusOrder[a.status] - statusOrder[b.status]; break;
      case 'priority': cmp = priorityOrder[a.priority] - priorityOrder[b.priority]; break;
      case 'assignee': cmp = (a.assignee || '').localeCompare(b.assignee || ''); break;
      case 'storyPoints': cmp = a.storyPoints - b.storyPoints; break;
      case 'dueDate': cmp = (a.dueDate || '').localeCompare(b.dueDate || ''); break;
    }
    return sortAsc ? cmp : -cmp;
  });

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
    setShowBulk(next.size > 0);
  };

  const toggleAll = () => {
    if (selectedIds.size === sorted.length) {
      setSelectedIds(new Set());
      setShowBulk(false);
    } else {
      setSelectedIds(new Set(sorted.map((t) => t.id)));
      setShowBulk(true);
    }
  };

  const bulkAction = (action: string) => {
    selectedIds.forEach((id) => {
      if (action === 'done') updateTask(id, { status: TaskStatus.Done });
      else if (action === 'in_progress') updateTask(id, { status: TaskStatus.InProgress });
    });
    setSelectedIds(new Set());
    setShowBulk(false);
  };

  const SortHeader = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-slate-500 hover:text-slate-300 transition-colors"
    >
      {label}
      <ArrowUpDown size={10} className={sortField === field ? 'text-blue-400' : 'text-slate-600'} />
    </button>
  );

  return (
    <div>
      {/* Bulk actions */}
      {showBulk && (
        <div className="flex items-center gap-3 mb-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg animate-fade-in">
          <span className="text-xs text-blue-400">{selectedIds.size} selected</span>
          <button onClick={() => bulkAction('in_progress')} className="text-xs text-slate-300 hover:text-white px-2 py-1 bg-slate-800 rounded">
            Move to In Progress
          </button>
          <button onClick={() => bulkAction('done')} className="text-xs text-slate-300 hover:text-white px-2 py-1 bg-slate-800 rounded">
            Mark Done
          </button>
          <button onClick={() => { setSelectedIds(new Set()); setShowBulk(false); }} className="text-xs text-slate-500 hover:text-slate-300 ml-auto">
            Clear
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="w-8 px-3 py-3">
                <input
                  type="checkbox"
                  checked={selectedIds.size === sorted.length && sorted.length > 0}
                  onChange={toggleAll}
                  className="rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-0 focus:ring-offset-0"
                />
              </th>
              <th className="px-3 py-3 text-left w-8" />
              <th className="px-3 py-3 text-left"><SortHeader field="title" label="Title" /></th>
              <th className="px-3 py-3 text-left"><SortHeader field="status" label="Status" /></th>
              <th className="px-3 py-3 text-left"><SortHeader field="priority" label="Priority" /></th>
              <th className="px-3 py-3 text-left"><SortHeader field="assignee" label="Assignee" /></th>
              <th className="px-3 py-3 text-left"><SortHeader field="storyPoints" label="Points" /></th>
              <th className="px-3 py-3 text-left"><SortHeader field="dueDate" label="Due Date" /></th>
              <th className="px-3 py-3 w-8" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((task) => (
              <tr
                key={task.id}
                className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors cursor-pointer"
                onClick={(e) => {
                  if ((e.target as HTMLElement).tagName !== 'INPUT') {
                    router.push(`/tasks/${task.id}`);
                  }
                }}
              >
                <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(task.id)}
                    onChange={() => toggleSelect(task.id)}
                    className="rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-0 focus:ring-offset-0"
                  />
                </td>
                <td className="px-3 py-2.5">{TYPE_ICONS[task.type]}</td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 font-mono shrink-0">{task.id}</span>
                    <span className="text-sm text-slate-200 truncate">{task.title}</span>
                    {task.labels.slice(0, 1).map((l) => (
                      <span key={l} className="px-1.5 py-0.5 bg-slate-800 text-slate-500 text-[10px] rounded shrink-0">
                        {l}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-3 py-2.5">
                  <span className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[task.status]}`} />
                    <span className="text-xs text-slate-400">{task.status.replace('_', ' ')}</span>
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <span className={`text-xs font-medium capitalize ${PRIORITY_COLOR[task.priority]}`}>
                    {task.priority}
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  {task.assignee ? (
                    <span className="text-xs text-slate-400">{task.assignee}</span>
                  ) : (
                    <span className="text-xs text-slate-600">Unassigned</span>
                  )}
                </td>
                <td className="px-3 py-2.5">
                  <span className="text-xs text-slate-400">{task.storyPoints || '-'}</span>
                </td>
                <td className="px-3 py-2.5">
                  <span className="text-xs text-slate-500">{task.dueDate || '-'}</span>
                </td>
                <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                  <button className="text-slate-600 hover:text-slate-400">
                    <MoreHorizontal size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && (
          <div className="py-12 text-center text-sm text-slate-500">No tasks match your filters</div>
        )}
      </div>
    </div>
  );
}
