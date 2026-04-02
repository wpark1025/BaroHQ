'use client';

import { useState } from 'react';
import { Plus, Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { ProjectPanel } from '@/components/projects/ProjectPanel';
import { AddProjectModal } from '@/components/projects/AddProjectModal';
import { ProjectStatus, ProjectPriority } from '@/lib/types';

export default function ProjectsPage() {
  const [showAdd, setShowAdd] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const {
    filterStatus, filterPriority, filterTeam, filterTag,
    setFilterStatus, setFilterPriority, setFilterTeam, setFilterTag,
    sortBy, sortOrder, setSortBy, setSortOrder,
    getFilteredProjects,
  } = useProjectStore();

  const projects = getFilteredProjects();
  const allTags = Array.from(new Set(useProjectStore.getState().projects.flatMap((p) => p.tags)));
  const allTeams = Array.from(new Set(useProjectStore.getState().projects.flatMap((p) => p.teams)));

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Projects</h1>
            <p className="text-sm text-slate-400 mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded transition-colors"
          >
            <Plus size={16} />
            New Project
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects..."
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 border rounded text-sm transition-colors ${
              showFilters ? 'border-blue-500 text-blue-400 bg-blue-500/10' : 'border-slate-700 text-slate-300 hover:border-slate-600'
            }`}
          >
            <SlidersHorizontal size={14} />
            Filters
          </button>
          <div className="flex items-center gap-1 border border-slate-700 rounded px-2">
            <ArrowUpDown size={14} className="text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'priority' | 'status' | 'updatedAt')}
              className="bg-transparent text-sm text-slate-300 py-2 pr-2 focus:outline-none"
            >
              <option value="updatedAt">Last Updated</option>
              <option value="name">Name</option>
              <option value="priority">Priority</option>
              <option value="status">Status</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="text-slate-400 hover:text-slate-200 px-1"
            >
              {sortOrder === 'asc' ? '\u2191' : '\u2193'}
            </button>
          </div>
        </div>

        {/* Filters bar */}
        {showFilters && (
          <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-slate-900/50 border border-slate-800 rounded-lg animate-fade-in">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 uppercase tracking-wide">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as ProjectStatus | 'all')}
                className="bg-slate-800 border border-slate-700 rounded text-sm text-slate-300 px-3 py-1.5 focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value={ProjectStatus.Planning}>Planning</option>
                <option value={ProjectStatus.Active}>Active</option>
                <option value={ProjectStatus.OnHold}>On Hold</option>
                <option value={ProjectStatus.Completed}>Completed</option>
                <option value={ProjectStatus.Archived}>Archived</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 uppercase tracking-wide">Priority</label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as ProjectPriority | 'all')}
                className="bg-slate-800 border border-slate-700 rounded text-sm text-slate-300 px-3 py-1.5 focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value={ProjectPriority.Critical}>Critical</option>
                <option value={ProjectPriority.High}>High</option>
                <option value={ProjectPriority.Medium}>Medium</option>
                <option value={ProjectPriority.Low}>Low</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 uppercase tracking-wide">Team</label>
              <select
                value={filterTeam}
                onChange={(e) => setFilterTeam(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded text-sm text-slate-300 px-3 py-1.5 focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Teams</option>
                {allTeams.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 uppercase tracking-wide">Tag</label>
              <select
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded text-sm text-slate-300 px-3 py-1.5 focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Tags</option>
                {allTags.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => {
                setFilterStatus('all');
                setFilterPriority('all');
                setFilterTeam('all');
                setFilterTag('all');
              }}
              className="self-end text-xs text-slate-500 hover:text-slate-300 underline py-1.5"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Project cards */}
        <ProjectPanel projects={projects} />
      </div>

      {showAdd && <AddProjectModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}
