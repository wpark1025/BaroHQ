'use client';

import { useState } from 'react';
import { X, Target, User, ListChecks, MessageSquare, Send } from 'lucide-react';
import type { Goal } from '@/lib/types';
import { GoalStatus } from '@/lib/types';
import { useProjectStore } from '@/store/useProjectStore';

const STATUS_BADGE: Record<string, string> = {
  [GoalStatus.NotStarted]: 'bg-slate-500/10 text-slate-400',
  [GoalStatus.InProgress]: 'bg-blue-500/10 text-blue-400',
  [GoalStatus.AtRisk]: 'bg-red-500/10 text-red-400',
  [GoalStatus.Completed]: 'bg-green-500/10 text-green-400',
  [GoalStatus.Cancelled]: 'bg-slate-500/10 text-slate-500',
};

interface GoalDetailProps {
  goal: Goal;
  onClose: () => void;
}

export function GoalDetail({ goal, onClose }: GoalDetailProps) {
  const getTaskById = useProjectStore((s) => s.getTaskById);
  const [commentText, setCommentText] = useState('');

  const linkedTasks = goal.linkedTasks.map((id) => getTaskById(id)).filter(Boolean);
  const doneTasks = linkedTasks.filter((t) => t!.status === 'done').length;
  const totalTasks = linkedTasks.length;
  const taskProgress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-lg max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Target size={16} className="text-blue-400" />
            <h2 className="text-lg font-semibold text-slate-100">Goal Details</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Title & Status */}
          <div>
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-base font-bold text-slate-200">{goal.title}</h3>
              <span className={`px-2 py-0.5 text-xs rounded ${STATUS_BADGE[goal.status]}`}>
                {goal.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">{goal.description}</p>
          </div>

          {/* Owner */}
          <div className="flex items-center gap-2">
            <User size={12} className="text-slate-500" />
            <span className="text-xs text-slate-500">Owner:</span>
            <span className="text-xs text-slate-300">{goal.owner}</span>
          </div>

          {/* Progress */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500">Overall Progress</span>
              <span className="text-xs text-slate-400">{goal.progress}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${goal.progress}%` }}
              />
            </div>
          </div>

          {/* Linked Tasks */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ListChecks size={14} className="text-green-400" />
              <span className="text-xs font-semibold text-slate-300">
                Linked Tasks ({doneTasks}/{totalTasks})
              </span>
            </div>

            {/* Task progress bar */}
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-3">
              <div className="h-full bg-green-500 rounded-full" style={{ width: `${taskProgress}%` }} />
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {linkedTasks.map((task) => (
                <div
                  key={task!.id}
                  className="flex items-center gap-3 p-2 bg-slate-800/50 rounded text-xs"
                >
                  <input
                    type="checkbox"
                    checked={task!.status === 'done'}
                    readOnly
                    className="rounded border-slate-600 bg-slate-800 text-green-500 focus:ring-0"
                  />
                  <span className={`flex-1 ${task!.status === 'done' ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                    {task!.title}
                  </span>
                  <span className="text-slate-600 font-mono">{task!.id}</span>
                </div>
              ))}
              {linkedTasks.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-4">No linked tasks</p>
              )}
            </div>
          </div>

          {/* Comments */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare size={14} className="text-purple-400" />
              <span className="text-xs font-semibold text-slate-300">
                Comments ({goal.comments.length})
              </span>
            </div>

            <div className="space-y-3 mb-3">
              {goal.comments.map((c) => (
                <div key={c.id} className="flex gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                    <span className="text-[8px] text-slate-400">{c.author[0].toUpperCase()}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-medium text-slate-300">{c.author}</span>
                      <span className="text-[9px] text-slate-600">{new Date(c.timestamp).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-slate-400">{c.text}</p>
                  </div>
                </div>
              ))}
              {goal.comments.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-2">No comments yet</p>
              )}
            </div>

            <div className="flex gap-2">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors">
                <Send size={12} />
              </button>
            </div>
          </div>

          {/* Meta */}
          <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-600 flex items-center gap-4">
            <span>Project: {goal.project || 'None'}</span>
            <span>Teams: {goal.teams.join(', ') || 'None'}</span>
            <span>Created: {new Date(goal.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
