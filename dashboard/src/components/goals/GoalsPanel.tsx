'use client';

import { useState } from 'react';
import { Target, ChevronRight, ChevronDown, Filter } from 'lucide-react';
import { useGoalStore } from '@/store/goalStore';
import { GoalDetail } from '@/components/goals/GoalDetail';
import { GoalStatus } from '@/lib/types';
import type { Goal } from '@/lib/types';

const STATUS_BADGE: Record<string, string> = {
  [GoalStatus.NotStarted]: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  [GoalStatus.InProgress]: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  [GoalStatus.AtRisk]: 'bg-red-500/10 text-red-400 border-red-500/20',
  [GoalStatus.Completed]: 'bg-green-500/10 text-green-400 border-green-500/20',
  [GoalStatus.Cancelled]: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
};

export function GoalsPanel() {
  const {
    filterProject, setFilterProject,
    filterTeam, setFilterTeam,
    filterStatus, setFilterStatus,
    getFilteredGoals, getTopLevelGoals, goals,
  } = useGoalStore();

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const topLevel = getTopLevelGoals();
  const filtered = getFilteredGoals();
  const selectedGoal = selectedGoalId ? goals.find((g) => g.id === selectedGoalId) : null;

  const toggleExpand = (id: string) => {
    const next = new Set(expandedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setExpandedIds(next);
  };

  const renderGoal = (goal: Goal, depth: number = 0) => {
    const childGoals = goals.filter((g) => goal.children.includes(g.id));
    const isExpanded = expandedIds.has(goal.id);
    const hasChildren = childGoals.length > 0;

    return (
      <div key={goal.id}>
        <div
          className="flex items-center gap-2 py-2.5 px-3 hover:bg-slate-800/30 rounded cursor-pointer transition-colors"
          style={{ paddingLeft: `${12 + depth * 20}px` }}
          onClick={() => setSelectedGoalId(goal.id)}
        >
          {hasChildren ? (
            <button
              onClick={(e) => { e.stopPropagation(); toggleExpand(goal.id); }}
              className="text-slate-500 hover:text-slate-300 shrink-0"
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : (
            <span className="w-[14px] shrink-0" />
          )}

          <Target size={14} className="text-blue-400 shrink-0" />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-200 truncate">{goal.title}</span>
              <span className={`px-1.5 py-0.5 text-[10px] rounded border ${STATUS_BADGE[goal.status]}`}>
                {goal.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-24 shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-500 w-7 text-right">{goal.progress}%</span>
            </div>
          </div>

          <span className="text-[10px] text-slate-500 w-16 text-right shrink-0">
            {goal.linkedTasks.length} tasks
          </span>
        </div>

        {/* Children */}
        {isExpanded && childGoals.map((child) => renderGoal(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Target size={16} className="text-blue-400" />
          Goals & Issues
        </h2>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-2 py-1 text-xs rounded transition-colors ${
            showFilters ? 'bg-blue-500/10 text-blue-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Filter size={12} />
          Filters
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex items-center gap-3 p-3 bg-slate-900/50 border border-slate-800 rounded-lg animate-fade-in">
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Projects</option>
            <option value="proj-1">Platform V2</option>
            <option value="proj-2">Mobile App</option>
            <option value="proj-3">Design System</option>
          </select>
          <select
            value={filterTeam}
            onChange={(e) => setFilterTeam(e.target.value)}
            className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Teams</option>
            <option value="team-eng">Engineering</option>
            <option value="team-design">Design</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as GoalStatus | 'all')}
            className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value={GoalStatus.NotStarted}>Not Started</option>
            <option value={GoalStatus.InProgress}>In Progress</option>
            <option value={GoalStatus.AtRisk}>At Risk</option>
            <option value={GoalStatus.Completed}>Completed</option>
          </select>
        </div>
      )}

      {/* Goal tree */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg divide-y divide-slate-800/50">
        {topLevel
          .filter((g) => filtered.some((fg) => fg.id === g.id))
          .map((goal) => renderGoal(goal))}
        {topLevel.filter((g) => filtered.some((fg) => fg.id === g.id)).length === 0 && (
          <div className="py-8 text-center text-sm text-slate-500">No goals match your filters</div>
        )}
      </div>

      {/* Goal detail modal */}
      {selectedGoal && (
        <GoalDetail goal={selectedGoal} onClose={() => setSelectedGoalId(null)} />
      )}
    </div>
  );
}
