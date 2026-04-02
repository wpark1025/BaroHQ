'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Calendar, User, Clock, GitBranch,
  LayoutDashboard, ListChecks, GanttChart, Users, DollarSign, Settings,
} from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { ProjectDetail } from '@/components/projects/ProjectDetail';
import { ProjectBoard } from '@/components/projects/ProjectBoard';
import { ProjectTimeline } from '@/components/projects/ProjectTimeline';
import { ProjectStatus, ProjectPriority } from '@/lib/types';

const STATUS_COLORS: Record<string, string> = {
  [ProjectStatus.Planning]: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  [ProjectStatus.Active]: 'bg-green-500/20 text-green-400 border-green-500/30',
  [ProjectStatus.OnHold]: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  [ProjectStatus.Completed]: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  [ProjectStatus.Archived]: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

const PRIORITY_COLORS: Record<string, string> = {
  [ProjectPriority.Critical]: 'text-red-400',
  [ProjectPriority.High]: 'text-orange-400',
  [ProjectPriority.Medium]: 'text-yellow-400',
  [ProjectPriority.Low]: 'text-slate-400',
};

type Tab = 'overview' | 'tasks' | 'timeline' | 'teams' | 'budget' | 'settings';

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: 'overview', label: 'Overview', icon: <LayoutDashboard size={14} /> },
  { key: 'tasks', label: 'Tasks', icon: <ListChecks size={14} /> },
  { key: 'timeline', label: 'Timeline', icon: <GanttChart size={14} /> },
  { key: 'teams', label: 'Teams', icon: <Users size={14} /> },
  { key: 'budget', label: 'Budget', icon: <DollarSign size={14} /> },
  { key: 'settings', label: 'Settings', icon: <Settings size={14} /> },
];

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const project = useProjectStore((s) => s.getProjectById(params.id as string));

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 text-lg">Project not found</p>
          <button onClick={() => router.push('/projects')} className="mt-4 text-blue-400 hover:text-blue-300 text-sm">
            Back to projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => router.push('/projects')}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 mb-4 transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Projects
        </button>

        {/* Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-slate-100">{project.name}</h1>
                <span className={`px-2 py-0.5 text-xs font-medium rounded border ${STATUS_COLORS[project.status]}`}>
                  {project.status.replace('_', ' ')}
                </span>
                <span className={`text-xs font-medium ${PRIORITY_COLORS[project.priority]}`}>
                  {project.priority.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-slate-400 mb-4">{project.description}</p>
              <div className="flex items-center gap-6 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <User size={12} />
                  Owner: {project.owner}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={12} />
                  {project.timeline.startDate} — {project.timeline.endDate}
                </span>
                <span className="flex items-center gap-1.5">
                  <GitBranch size={12} />
                  {project.git.repo}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={12} />
                  Updated {new Date(project.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="text-right">
                <p className="text-xs text-slate-500">Progress</p>
                <p className="text-lg font-bold text-slate-200">
                  {project.timeline.milestones.filter((m) => m.status === 'completed').length} / {project.timeline.milestones.length}
                </p>
              </div>
              <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{
                    width: `${project.timeline.milestones.length > 0
                      ? (project.timeline.milestones.filter((m) => m.status === 'completed').length / project.timeline.milestones.length) * 100
                      : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2 mt-4">
            {project.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 bg-slate-800 text-slate-400 text-xs rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-slate-800 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'overview' && <ProjectDetail project={project} />}

        {activeTab === 'tasks' && <ProjectBoard projectId={project.id} />}

        {activeTab === 'timeline' && <ProjectTimeline project={project} />}

        {activeTab === 'teams' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-200">Teams</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.teams.map((teamId) => (
                <div key={teamId} className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-slate-200">{teamId}</h3>
                    {project.teamLeads[teamId] && (
                      <span className="text-xs text-slate-500">Lead: {project.teamLeads[teamId]}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="w-7 h-7 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center">
                          <span className="text-[10px] text-slate-400">{i}</span>
                        </div>
                      ))}
                    </div>
                    <span className="text-xs text-slate-500">3 members</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'budget' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-200">Budget</h2>
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-slate-400">Allocated Budget</p>
                  <p className="text-2xl font-bold text-slate-100">${project.budget.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400">Estimated Spend</p>
                  <p className="text-2xl font-bold text-green-400">${Math.round(project.budget * 0.65).toLocaleString()}</p>
                </div>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: '65%' }} />
              </div>
              <p className="text-xs text-slate-500 mt-2">65% utilized</p>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-200">Project Settings</h2>
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Project Name</label>
                <input
                  type="text"
                  defaultValue={project.name}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Slug</label>
                <input
                  type="text"
                  defaultValue={project.slug}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  defaultValue={project.description}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
              <div className="flex items-center gap-3 pt-4">
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded transition-colors">
                  Save Changes
                </button>
                <button className="px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 text-sm font-medium rounded border border-red-500/20 transition-colors">
                  Archive Project
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
