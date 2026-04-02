'use client';

import { useRouter } from 'next/navigation';
import { Calendar, Users } from 'lucide-react';
import { Project, ProjectStatus, ProjectPriority } from '@/lib/types';

const STATUS_DOT: Record<string, string> = {
  [ProjectStatus.Planning]: 'bg-yellow-400',
  [ProjectStatus.Active]: 'bg-green-400',
  [ProjectStatus.OnHold]: 'bg-orange-400',
  [ProjectStatus.Completed]: 'bg-blue-400',
  [ProjectStatus.Archived]: 'bg-slate-500',
};

const STATUS_BADGE: Record<string, string> = {
  [ProjectStatus.Planning]: 'bg-yellow-500/10 text-yellow-400',
  [ProjectStatus.Active]: 'bg-green-500/10 text-green-400',
  [ProjectStatus.OnHold]: 'bg-orange-500/10 text-orange-400',
  [ProjectStatus.Completed]: 'bg-blue-500/10 text-blue-400',
  [ProjectStatus.Archived]: 'bg-slate-500/10 text-slate-400',
};

const PRIORITY_COLORS: Record<string, string> = {
  [ProjectPriority.Critical]: 'text-red-400',
  [ProjectPriority.High]: 'text-orange-400',
  [ProjectPriority.Medium]: 'text-yellow-400',
  [ProjectPriority.Low]: 'text-slate-400',
};

interface ProjectPanelProps {
  projects: Project[];
}

export function ProjectPanel({ projects }: ProjectPanelProps) {
  const router = useRouter();

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-slate-800 rounded-lg flex items-center justify-center mb-4">
          <Users size={24} className="text-slate-600" />
        </div>
        <p className="text-slate-400 text-sm">No projects match your filters</p>
        <p className="text-slate-500 text-xs mt-1">Try adjusting your filters or create a new project</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => {
        const milestoneProgress = project.timeline.milestones.length > 0
          ? Math.round((project.timeline.milestones.filter((m) => m.status === 'completed').length / project.timeline.milestones.length) * 100)
          : 0;

        return (
          <div
            key={project.id}
            onClick={() => router.push(`/projects/${project.id}`)}
            className="bg-slate-900 border border-slate-800 rounded-lg p-5 cursor-pointer hover:border-slate-700 transition-all group"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${STATUS_DOT[project.status]}`} />
                <h3 className="text-sm font-semibold text-slate-100 group-hover:text-blue-400 transition-colors">
                  {project.name}
                </h3>
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-medium rounded ${STATUS_BADGE[project.status]}`}>
                {project.status.replace('_', ' ')}
              </span>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-400 mb-4 line-clamp-2">{project.description}</p>

            {/* Progress bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-slate-500 uppercase tracking-wide">Progress</span>
                <span className="text-[10px] text-slate-400">{milestoneProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${milestoneProgress}%` }}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Team pills */}
                {project.teams.slice(0, 2).map((teamId) => (
                  <span
                    key={teamId}
                    className="px-2 py-0.5 bg-slate-800 text-slate-400 text-[10px] rounded"
                  >
                    {teamId.replace('team-', '')}
                  </span>
                ))}
                {project.teams.length > 2 && (
                  <span className="text-[10px] text-slate-500">+{project.teams.length - 2}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-medium ${PRIORITY_COLORS[project.priority]}`}>
                  {project.priority}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-slate-500">
                  <Calendar size={10} />
                  {project.timeline.endDate}
                </span>
              </div>
            </div>

            {/* Team avatars */}
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-800">
              <div className="flex -space-x-1.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center"
                  >
                    <span className="text-[8px] text-slate-400">{String.fromCharCode(65 + i)}</span>
                  </div>
                ))}
              </div>
              <span className="text-[10px] text-slate-500">
                {project.tags.slice(0, 2).join(', ')}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
