'use client';

import { Search, X } from 'lucide-react';
import { useTaskStore } from '@/store/taskStore';
import { TaskType, TaskStatus, TaskPriority } from '@/lib/types';

export function TaskFilters() {
  const {
    searchQuery, setSearchQuery,
    filterType, setFilterType,
    filterStatus, setFilterStatus,
    filterPriority, setFilterPriority,
    filterAssignee, setFilterAssignee,
    filterProject, setFilterProject,
    filterSprint, setFilterSprint,
    filterLabel, setFilterLabel,
    filterReporter, setFilterReporter,
  } = useTaskStore();

  const hasFilters =
    filterType !== 'all' ||
    filterStatus !== 'all' ||
    filterPriority !== 'all' ||
    filterAssignee !== 'all' ||
    filterProject !== 'all' ||
    filterSprint !== 'all' ||
    filterLabel !== 'all' ||
    filterReporter !== 'all' ||
    searchQuery !== '';

  const clearAll = () => {
    setSearchQuery('');
    setFilterType('all');
    setFilterStatus('all');
    setFilterPriority('all');
    setFilterAssignee('all');
    setFilterProject('all');
    setFilterSprint('all');
    setFilterLabel('all');
    setFilterReporter('all');
  };

  return (
    <div className="space-y-3">
      {/* Search + quick filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-900 border border-slate-700 rounded text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X size={12} />
            </button>
          )}
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as TaskType | 'all')}
          className="px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-300 focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Types</option>
          <option value={TaskType.Epic}>Epic</option>
          <option value={TaskType.Story}>Story</option>
          <option value={TaskType.Task}>Task</option>
          <option value={TaskType.Bug}>Bug</option>
          <option value={TaskType.Subtask}>Sub-task</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as TaskStatus | 'all')}
          className="px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-300 focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Statuses</option>
          <option value={TaskStatus.Backlog}>Backlog</option>
          <option value={TaskStatus.Todo}>To Do</option>
          <option value={TaskStatus.InProgress}>In Progress</option>
          <option value={TaskStatus.InReview}>In Review</option>
          <option value={TaskStatus.Done}>Done</option>
        </select>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value as TaskPriority | 'all')}
          className="px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-300 focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Priorities</option>
          <option value={TaskPriority.Critical}>Critical</option>
          <option value={TaskPriority.High}>High</option>
          <option value={TaskPriority.Medium}>Medium</option>
          <option value={TaskPriority.Low}>Low</option>
        </select>

        <select
          value={filterAssignee}
          onChange={(e) => setFilterAssignee(e.target.value)}
          className="px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-300 focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Assignees</option>
          <option value="agent-1">agent-1</option>
          <option value="agent-2">agent-2</option>
          <option value="agent-3">agent-3</option>
          <option value="agent-4">agent-4</option>
          <option value="">Unassigned</option>
        </select>

        <select
          value={filterProject}
          onChange={(e) => setFilterProject(e.target.value)}
          className="px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-300 focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Projects</option>
          <option value="proj-1">Platform V2</option>
          <option value="proj-2">Mobile App</option>
          <option value="proj-3">Design System</option>
        </select>

        <select
          value={filterSprint}
          onChange={(e) => setFilterSprint(e.target.value)}
          className="px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-300 focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Sprints</option>
          <option value="sprint-1">Sprint 1</option>
          <option value="sprint-2">Sprint 2</option>
          <option value="sprint-3">Design Sprint 1</option>
          <option value="">No Sprint</option>
        </select>

        <select
          value={filterLabel}
          onChange={(e) => setFilterLabel(e.target.value)}
          className="px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-300 focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Labels</option>
          <option value="auth">auth</option>
          <option value="backend">backend</option>
          <option value="security">security</option>
          <option value="design">design</option>
          <option value="frontend">frontend</option>
          <option value="bug">bug</option>
        </select>

        <select
          value={filterReporter}
          onChange={(e) => setFilterReporter(e.target.value)}
          className="px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-300 focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Reporters</option>
          <option value="agent-ceo">agent-ceo</option>
          <option value="agent-1">agent-1</option>
          <option value="agent-2">agent-2</option>
          <option value="agent-3">agent-3</option>
        </select>

        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-xs text-slate-500 hover:text-slate-300 underline transition-colors"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
