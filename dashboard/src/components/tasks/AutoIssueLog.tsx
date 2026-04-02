'use client';

import { AlertTriangle, Link2, Bot, ExternalLink } from 'lucide-react';
import { useTaskStore } from '@/store/taskStore';

const SEVERITY_BADGE: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

const STATUS_BADGE: Record<string, string> = {
  open: 'bg-red-500/10 text-red-400',
  triaged: 'bg-yellow-500/10 text-yellow-400',
  resolved: 'bg-green-500/10 text-green-400',
};

export function AutoIssueLog() {
  const autoIssues = useTaskStore((s) => s.autoIssues);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle size={16} className="text-amber-400" />
        <h2 className="text-sm font-semibold text-slate-200">Auto-Created Issues</h2>
        <span className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded-full">
          {autoIssues.length}
        </span>
      </div>

      <div className="space-y-2">
        {autoIssues.map((issue) => (
          <div
            key={issue.id}
            className="bg-slate-900 border border-slate-800 rounded-lg p-4 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded border ${SEVERITY_BADGE[issue.severity]}`}>
                  {issue.severity}
                </span>
                <span className={`px-1.5 py-0.5 text-[10px] rounded ${STATUS_BADGE[issue.status]}`}>
                  {issue.status}
                </span>
              </div>
              <span className="text-[10px] text-slate-500">
                {new Date(issue.createdAt).toLocaleString()}
              </span>
            </div>

            <p className="text-sm text-slate-200 mb-2">{issue.error}</p>

            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Bot size={10} />
                {issue.sourceAgent}
              </span>
              {issue.linkedTaskId && (
                <span className="flex items-center gap-1 text-blue-400">
                  <Link2 size={10} />
                  {issue.linkedTaskId}
                  <ExternalLink size={8} />
                </span>
              )}
            </div>
          </div>
        ))}

        {autoIssues.length === 0 && (
          <div className="py-8 text-center">
            <AlertTriangle size={20} className="text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No auto-created issues</p>
          </div>
        )}
      </div>
    </div>
  );
}
