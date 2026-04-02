'use client';

import { CheckCircle2, Circle, Clock, Activity, Target, TrendingUp } from 'lucide-react';
import { Project } from '@/lib/types';
import { useProjectStore } from '@/store/useProjectStore';

interface ProjectDetailProps {
  project: Project;
}

export function ProjectDetail({ project }: ProjectDetailProps) {
  const tasks = useProjectStore((s) => s.getTasksByProject(project.id));
  const doneTasks = tasks.filter((t) => t.status === 'done').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const totalPoints = tasks.reduce((sum, t) => sum + t.storyPoints, 0);
  const donePoints = tasks.filter((t) => t.status === 'done').reduce((sum, t) => sum + t.storyPoints, 0);

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target size={14} className="text-blue-400" />
            <span className="text-xs text-slate-500 uppercase tracking-wide">Tasks</span>
          </div>
          <p className="text-2xl font-bold text-slate-100">{tasks.length}</p>
          <p className="text-xs text-slate-500 mt-1">{doneTasks} completed</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={14} className="text-green-400" />
            <span className="text-xs text-slate-500 uppercase tracking-wide">In Progress</span>
          </div>
          <p className="text-2xl font-bold text-slate-100">{inProgressTasks}</p>
          <p className="text-xs text-slate-500 mt-1">active tasks</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={14} className="text-purple-400" />
            <span className="text-xs text-slate-500 uppercase tracking-wide">Story Points</span>
          </div>
          <p className="text-2xl font-bold text-slate-100">{donePoints} / {totalPoints}</p>
          <p className="text-xs text-slate-500 mt-1">
            {totalPoints > 0 ? Math.round((donePoints / totalPoints) * 100) : 0}% velocity
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={14} className="text-orange-400" />
            <span className="text-xs text-slate-500 uppercase tracking-wide">Milestones</span>
          </div>
          <p className="text-2xl font-bold text-slate-100">
            {project.timeline.milestones.filter((m) => m.status === 'completed').length} / {project.timeline.milestones.length}
          </p>
          <p className="text-xs text-slate-500 mt-1">completed</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Description */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-slate-200 mb-3">Description</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{project.description}</p>
          </div>

          {/* Milestones */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-slate-200 mb-4">Milestones</h3>
            <div className="space-y-3">
              {project.timeline.milestones.map((ms) => (
                <div key={ms.id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                  {ms.status === 'completed' ? (
                    <CheckCircle2 size={16} className="text-green-400 shrink-0" />
                  ) : (
                    <Circle size={16} className="text-slate-500 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${ms.status === 'completed' ? 'text-slate-300' : 'text-slate-200'}`}>
                      {ms.name}
                    </p>
                  </div>
                  <span className="text-xs text-slate-500 shrink-0">{ms.date}</span>
                  <span
                    className={`px-2 py-0.5 text-[10px] rounded ${
                      ms.status === 'completed'
                        ? 'bg-green-500/10 text-green-400'
                        : ms.status === 'in_progress'
                        ? 'bg-blue-500/10 text-blue-400'
                        : 'bg-slate-700 text-slate-400'
                    }`}
                  >
                    {ms.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-slate-200 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {tasks
                .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                .slice(0, 5)
                .map((task) => (
                  <div key={task.id} className="flex items-center gap-3 text-xs">
                    <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                      <span className="text-[8px] text-slate-400">
                        {(task.assignee || 'U')[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-slate-300">{task.title}</span>
                      <span className="text-slate-500"> — {task.status.replace('_', ' ')}</span>
                    </div>
                    <span className="text-slate-600 shrink-0">
                      {new Date(task.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              {tasks.length === 0 && (
                <p className="text-sm text-slate-500">No recent activity</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-slate-200 mb-4">Details</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-[10px] text-slate-500 uppercase tracking-wide">Owner</dt>
                <dd className="text-sm text-slate-300 mt-0.5">{project.owner}</dd>
              </div>
              <div>
                <dt className="text-[10px] text-slate-500 uppercase tracking-wide">Priority</dt>
                <dd className="text-sm text-slate-300 mt-0.5 capitalize">{project.priority}</dd>
              </div>
              <div>
                <dt className="text-[10px] text-slate-500 uppercase tracking-wide">Start Date</dt>
                <dd className="text-sm text-slate-300 mt-0.5">{project.timeline.startDate}</dd>
              </div>
              <div>
                <dt className="text-[10px] text-slate-500 uppercase tracking-wide">Target Date</dt>
                <dd className="text-sm text-slate-300 mt-0.5">{project.timeline.endDate}</dd>
              </div>
              <div>
                <dt className="text-[10px] text-slate-500 uppercase tracking-wide">Repository</dt>
                <dd className="text-sm text-blue-400 mt-0.5">{project.git.repo}</dd>
              </div>
              <div>
                <dt className="text-[10px] text-slate-500 uppercase tracking-wide">Budget</dt>
                <dd className="text-sm text-slate-300 mt-0.5">${project.budget.toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-[10px] text-slate-500 uppercase tracking-wide">Sprints</dt>
                <dd className="text-sm text-slate-300 mt-0.5">{project.sprints.length}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-slate-200 mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span key={tag} className="px-2 py-1 bg-slate-800 text-slate-400 text-xs rounded">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
