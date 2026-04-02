'use client';

import { useState } from 'react';
import {
  Bug, BookOpen, CheckSquare, Layers, Clock, User, Zap, Calendar,
  Tag, Link2, MessageSquare, History, ChevronDown, Send, Plus,
} from 'lucide-react';
import { Task, TaskType, TaskStatus, TaskPriority } from '@/lib/types';
import { useTaskStore } from '@/store/taskStore';

const TYPE_META: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  [TaskType.Epic]: { icon: <Layers size={16} />, color: 'text-purple-400 bg-purple-500/10', label: 'Epic' },
  [TaskType.Story]: { icon: <BookOpen size={16} />, color: 'text-green-400 bg-green-500/10', label: 'Story' },
  [TaskType.Task]: { icon: <CheckSquare size={16} />, color: 'text-blue-400 bg-blue-500/10', label: 'Task' },
  [TaskType.Bug]: { icon: <Bug size={16} />, color: 'text-red-400 bg-red-500/10', label: 'Bug' },
  [TaskType.Subtask]: { icon: <CheckSquare size={14} />, color: 'text-slate-400 bg-slate-500/10', label: 'Sub-task' },
};

const STATUS_OPTIONS: { value: TaskStatus; label: string; color: string }[] = [
  { value: TaskStatus.Backlog, label: 'Backlog', color: 'bg-slate-500' },
  { value: TaskStatus.Todo, label: 'To Do', color: 'bg-blue-500' },
  { value: TaskStatus.InProgress, label: 'In Progress', color: 'bg-yellow-500' },
  { value: TaskStatus.InReview, label: 'In Review', color: 'bg-purple-500' },
  { value: TaskStatus.Done, label: 'Done', color: 'bg-green-500' },
];

const PRIORITY_COLORS: Record<string, string> = {
  [TaskPriority.Critical]: 'text-red-400',
  [TaskPriority.High]: 'text-orange-400',
  [TaskPriority.Medium]: 'text-yellow-400',
  [TaskPriority.Low]: 'text-slate-400',
  [TaskPriority.None]: 'text-slate-500',
};

interface TaskDetailProps {
  task: Task;
}

export function TaskDetail({ task }: TaskDetailProps) {
  const updateTask = useTaskStore((s) => s.updateTask);
  const getTaskById = useTaskStore((s) => s.getTaskById);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<'comments' | 'history'>('comments');
  const [commentText, setCommentText] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(task.title);

  const typeMeta = TYPE_META[task.type] || TYPE_META[TaskType.Task];
  const currentStatus = STATUS_OPTIONS.find((s) => s.value === task.status);
  const subtasks = task.children.map((id) => getTaskById(id)).filter(Boolean) as Task[];
  const timePercent = task.timeTracking.estimated > 0 ? Math.round((task.timeTracking.logged / task.timeTracking.estimated) * 100) : 0;

  const handleStatusChange = (status: TaskStatus) => {
    updateTask(task.id, { status, updatedAt: new Date().toISOString() });
    setShowStatusDropdown(false);
  };

  const handleTitleSave = () => {
    if (titleValue.trim() && titleValue !== task.title) {
      updateTask(task.id, { title: titleValue, updatedAt: new Date().toISOString() });
    }
    setEditingTitle(false);
  };

  const addComment = () => {
    if (!commentText.trim()) return;
    const newComment = {
      id: `c-${Date.now()}`,
      author: 'current-user',
      text: commentText,
      timestamp: new Date().toISOString(),
      edited: false,
    };
    updateTask(task.id, { comments: [...task.comments, newComment] });
    setCommentText('');
  };

  return (
    <div className="flex gap-6">
      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-6">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${typeMeta.color}`}>
              {typeMeta.icon}
              {typeMeta.label}
            </span>
            <span className="text-xs text-slate-500 font-mono">{task.id}</span>
          </div>

          {editingTitle ? (
            <input
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
              autoFocus
              className="text-xl font-bold text-slate-100 bg-transparent border-b border-blue-500 focus:outline-none w-full"
            />
          ) : (
            <h1
              onClick={() => setEditingTitle(true)}
              className="text-xl font-bold text-slate-100 cursor-text hover:text-blue-300 transition-colors"
            >
              {task.title}
            </h1>
          )}

          {/* Status dropdown */}
          <div className="relative inline-block">
            <button
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-sm text-slate-300 hover:border-slate-600 transition-colors"
            >
              <span className={`w-2 h-2 rounded-full ${currentStatus?.color}`} />
              {currentStatus?.label}
              <ChevronDown size={12} />
            </button>
            {showStatusDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-10 py-1 min-w-[160px]">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleStatusChange(opt.value)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-700 transition-colors ${
                      task.status === opt.value ? 'text-blue-400' : 'text-slate-300'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${opt.color}`} />
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Description</h3>
          <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
            {task.description || 'No description provided.'}
          </div>
        </div>

        {/* Subtasks */}
        {(subtasks.length > 0 || task.children.length > 0) && (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Subtasks ({subtasks.filter((s) => s.status === TaskStatus.Done).length}/{subtasks.length})
              </h3>
              <button className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                <Plus size={12} /> Add
              </button>
            </div>
            <div className="space-y-2">
              {subtasks.map((sub) => (
                <div key={sub.id} className="flex items-center gap-3 p-2 rounded hover:bg-slate-800/50">
                  <input
                    type="checkbox"
                    checked={sub.status === TaskStatus.Done}
                    readOnly
                    className="rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-0"
                  />
                  <span className={`text-sm ${sub.status === TaskStatus.Done ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                    {sub.title}
                  </span>
                  <span className="text-[10px] text-slate-500 ml-auto">{sub.id}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Linked tasks */}
        {task.linkedTasks.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Link2 size={12} />
              Linked Tasks
            </h3>
            <div className="space-y-2">
              {task.linkedTasks.map((link) => {
                const linked = getTaskById(link.taskId);
                return (
                  <div key={link.taskId} className="flex items-center gap-3 p-2 bg-slate-800/50 rounded text-sm">
                    <span className="text-[10px] text-slate-500 uppercase">{link.relation.replace('_', ' ')}</span>
                    <span className="text-slate-300">{linked?.title || link.taskId}</span>
                    <span className="text-[10px] text-slate-500 ml-auto">{link.taskId}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Activity tabs */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg">
          <div className="flex items-center gap-1 border-b border-slate-800 px-4">
            <button
              onClick={() => setActiveTab('comments')}
              className={`flex items-center gap-2 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                activeTab === 'comments' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400'
              }`}
            >
              <MessageSquare size={12} />
              Comments ({task.comments.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                activeTab === 'history' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400'
              }`}
            >
              <History size={12} />
              History ({task.history.length})
            </button>
          </div>

          <div className="p-4">
            {activeTab === 'comments' && (
              <div className="space-y-4">
                {task.comments.map((c) => (
                  <div key={c.id} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                      <span className="text-[10px] text-slate-400">{c.author[0].toUpperCase()}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-slate-300">{c.author}</span>
                        <span className="text-[10px] text-slate-500">{new Date(c.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-slate-400">{c.text}</p>
                    </div>
                  </div>
                ))}
                {task.comments.length === 0 && <p className="text-xs text-slate-500">No comments yet</p>}

                <div className="flex gap-2 pt-2">
                  <input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addComment()}
                    placeholder="Add a comment..."
                    className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <button onClick={addComment} className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors">
                    <Send size={14} />
                  </button>
                </div>
              </div>
            )}
            {activeTab === 'history' && (
              <div className="space-y-3">
                {task.history.map((h) => (
                  <div key={h.id} className="flex items-start gap-3 text-xs">
                    <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                      <History size={10} className="text-slate-400" />
                    </div>
                    <div>
                      <span className="text-slate-400">{h.changedBy}</span>
                      <span className="text-slate-500"> changed </span>
                      <span className="text-slate-300">{h.field}</span>
                      <span className="text-slate-500"> from </span>
                      <span className="text-red-400/70 line-through">{h.oldValue}</span>
                      <span className="text-slate-500"> to </span>
                      <span className="text-green-400">{h.newValue}</span>
                      <p className="text-slate-600 mt-0.5">{new Date(h.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
                {task.history.length === 0 && <p className="text-xs text-slate-500">No history</p>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-64 shrink-0 space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-4">
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1 flex items-center gap-1"><User size={10} /> Assignee</p>
            <p className="text-sm text-slate-300">{task.assignee || 'Unassigned'}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">Reporter</p>
            <p className="text-sm text-slate-300">{task.reporter || 'Unknown'}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1 flex items-center gap-1"><Zap size={10} /> Sprint</p>
            <p className="text-sm text-slate-300">{task.sprint || 'No sprint'}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">Priority</p>
            <p className={`text-sm font-medium capitalize ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">Story Points</p>
            <p className="text-sm text-slate-300">{task.storyPoints || '-'}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1 flex items-center gap-1"><Calendar size={10} /> Due Date</p>
            <p className="text-sm text-slate-300">{task.dueDate || 'No due date'}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">Project</p>
            <p className="text-sm text-slate-300">{task.project || '-'}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">Team</p>
            <p className="text-sm text-slate-300">{task.team || '-'}</p>
          </div>
        </div>

        {/* Time tracking */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
            <Clock size={10} /> Time Tracking
          </p>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>{Math.round(task.timeTracking.logged / 60)}h logged</span>
            <span>{Math.round(task.timeTracking.estimated / 60)}h est.</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${timePercent > 100 ? 'bg-red-500' : 'bg-blue-500'}`}
              style={{ width: `${Math.min(100, timePercent)}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 mt-1">{timePercent}%</p>
        </div>

        {/* Labels */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
            <Tag size={10} /> Labels
          </p>
          <div className="flex flex-wrap gap-1.5">
            {task.labels.map((label) => (
              <span key={label} className="px-2 py-0.5 bg-slate-800 text-slate-400 text-xs rounded">
                {label}
              </span>
            ))}
            {task.labels.length === 0 && <span className="text-xs text-slate-600">None</span>}
          </div>
        </div>

        {/* Dates */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-2 text-xs text-slate-500">
          <div className="flex justify-between">
            <span>Created</span>
            <span className="text-slate-400">{new Date(task.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Updated</span>
            <span className="text-slate-400">{new Date(task.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
