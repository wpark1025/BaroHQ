'use client';

import { Flag, CheckCircle2, Circle, Clock } from 'lucide-react';
import { Project } from '@/lib/types';

interface ProjectTimelineProps {
  project: Project;
}

export function ProjectTimeline({ project }: ProjectTimelineProps) {
  const start = new Date(project.timeline.startDate);
  const end = new Date(project.timeline.endDate);
  const totalDays = Math.max(1, (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const today = new Date();
  const todayOffset = Math.min(100, Math.max(0, ((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) / totalDays) * 100));

  const getMilestoneOffset = (dateStr: string) => {
    const d = new Date(dateStr);
    return Math.min(100, Math.max(0, ((d.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) / totalDays) * 100));
  };

  // Generate month markers
  const months: { label: string; offset: number }[] = [];
  const cursor = new Date(start);
  cursor.setDate(1);
  if (cursor < start) cursor.setMonth(cursor.getMonth() + 1);
  while (cursor <= end) {
    months.push({
      label: cursor.toLocaleString('default', { month: 'short', year: '2-digit' }),
      offset: ((cursor.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) / totalDays) * 100,
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-200">Timeline</h2>

      {/* Gantt bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        {/* Date range header */}
        <div className="flex items-center justify-between mb-6 text-xs text-slate-500">
          <span>{project.timeline.startDate}</span>
          <span>{project.timeline.endDate}</span>
        </div>

        {/* Month markers */}
        <div className="relative h-8 mb-4">
          {months.map((m, i) => (
            <div
              key={i}
              className="absolute top-0 flex flex-col items-center"
              style={{ left: `${m.offset}%` }}
            >
              <div className="w-px h-3 bg-slate-700" />
              <span className="text-[10px] text-slate-600 mt-1">{m.label}</span>
            </div>
          ))}
        </div>

        {/* Main bar */}
        <div className="relative">
          {/* Background track */}
          <div className="h-10 bg-slate-800 rounded-lg relative overflow-hidden">
            {/* Progress fill */}
            <div
              className="h-full bg-blue-500/20 rounded-l-lg border-r-2 border-blue-500"
              style={{ width: `${todayOffset}%` }}
            />

            {/* Today marker */}
            <div
              className="absolute top-0 h-full w-px bg-blue-400"
              style={{ left: `${todayOffset}%` }}
            >
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-blue-500 text-white text-[10px] rounded whitespace-nowrap">
                Today
              </div>
            </div>

            {/* Milestone markers */}
            {project.timeline.milestones.map((ms) => {
              const offset = getMilestoneOffset(ms.date);
              return (
                <div
                  key={ms.id}
                  className="absolute top-1/2 -translate-y-1/2"
                  style={{ left: `${offset}%` }}
                >
                  <div className="relative group">
                    <div className={`w-4 h-4 rotate-45 border-2 ${
                      ms.status === 'completed'
                        ? 'bg-green-500 border-green-400'
                        : ms.status === 'in_progress'
                        ? 'bg-yellow-500 border-yellow-400'
                        : 'bg-slate-600 border-slate-500'
                    }`} />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-700 text-slate-200 text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {ms.name} ({ms.date})
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-6 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <div className="w-3 h-3 rotate-45 bg-green-500 border border-green-400" />
            Completed
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-3 h-3 rotate-45 bg-yellow-500 border border-yellow-400" />
            In Progress
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-3 h-3 rotate-45 bg-slate-600 border border-slate-500" />
            Pending
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-3 h-px bg-blue-400" />
            Today
          </span>
        </div>
      </div>

      {/* Milestone list */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <Flag size={14} className="text-blue-400" />
          Milestones
        </h3>
        <div className="space-y-3">
          {project.timeline.milestones.map((ms) => {
            const isPast = new Date(ms.date) < today;
            return (
              <div key={ms.id} className="flex items-center gap-4 p-3 bg-slate-800/50 rounded-lg">
                {ms.status === 'completed' ? (
                  <CheckCircle2 size={18} className="text-green-400 shrink-0" />
                ) : isPast ? (
                  <Clock size={18} className="text-red-400 shrink-0" />
                ) : (
                  <Circle size={18} className="text-slate-500 shrink-0" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-200">{ms.name}</p>
                  <p className="text-xs text-slate-500">{ms.date}</p>
                </div>
                <span
                  className={`px-2 py-0.5 text-xs rounded ${
                    ms.status === 'completed'
                      ? 'bg-green-500/10 text-green-400'
                      : ms.status === 'in_progress'
                      ? 'bg-yellow-500/10 text-yellow-400'
                      : isPast
                      ? 'bg-red-500/10 text-red-400'
                      : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {ms.status === 'completed' ? 'Completed' : ms.status === 'in_progress' ? 'In Progress' : isPast ? 'Overdue' : 'Pending'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
