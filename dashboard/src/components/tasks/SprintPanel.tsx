'use client';

import { useState } from 'react';
import { Plus, Play, CheckCircle, Clock, Zap, Target, TrendingUp } from 'lucide-react';
import { useTaskStore } from '@/store/taskStore';
import { SprintStatus, TaskStatus, Sprint } from '@/lib/types';

const STATUS_BADGE: Record<string, string> = {
  [SprintStatus.Planning]: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  [SprintStatus.Active]: 'bg-green-500/10 text-green-400 border-green-500/30',
  [SprintStatus.Completed]: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
  [SprintStatus.Cancelled]: 'bg-red-500/10 text-red-400 border-red-500/30',
};

export function SprintPanel() {
  const sprints = useTaskStore((s) => s.sprints);
  const getTaskById = useTaskStore((s) => s.getTaskById);
  const updateSprint = useTaskStore((s) => s.updateSprint);
  const addSprint = useTaskStore((s) => s.addSprint);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGoal, setNewGoal] = useState('');
  const [newStart, setNewStart] = useState('');
  const [newEnd, setNewEnd] = useState('');
  const [newProject, setNewProject] = useState('');

  const activeSprints = sprints.filter((s) => s.status === SprintStatus.Active);
  const planningSprints = sprints.filter((s) => s.status === SprintStatus.Planning);
  const completedSprints = sprints.filter((s) => s.status === SprintStatus.Completed);

  const getSprintStats = (sprint: Sprint) => {
    const tasks = sprint.tasks.map((id) => getTaskById(id)).filter(Boolean);
    const total = tasks.length;
    const done = tasks.filter((t) => t!.status === TaskStatus.Done).length;
    const inProgress = tasks.filter((t) => t!.status === TaskStatus.InProgress).length;
    const points = tasks.reduce((sum, t) => sum + (t!.storyPoints || 0), 0);
    const donePoints = tasks.filter((t) => t!.status === TaskStatus.Done).reduce((sum, t) => sum + (t!.storyPoints || 0), 0);
    return { total, done, inProgress, points, donePoints };
  };

  const handleStartSprint = (id: string) => {
    updateSprint(id, { status: SprintStatus.Active });
  };

  const handleCompleteSprint = (id: string) => {
    updateSprint(id, { status: SprintStatus.Completed });
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    addSprint({
      id: `sprint-${Date.now()}`,
      name: newName,
      project: newProject,
      status: SprintStatus.Planning,
      startDate: newStart,
      endDate: newEnd,
      goal: newGoal,
      tasks: [],
      velocity: 0,
    });
    setNewName('');
    setNewGoal('');
    setNewStart('');
    setNewEnd('');
    setShowCreate(false);
  };

  const renderSprintCard = (sprint: Sprint) => {
    const stats = getSprintStats(sprint);
    const progressPercent = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

    return (
      <div key={sprint.id} className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold text-slate-200">{sprint.name}</h3>
              <span className={`px-2 py-0.5 text-[10px] font-medium rounded border ${STATUS_BADGE[sprint.status]}`}>
                {sprint.status}
              </span>
            </div>
            {sprint.goal && (
              <p className="text-xs text-slate-400">{sprint.goal}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {sprint.status === SprintStatus.Planning && (
              <button
                onClick={() => handleStartSprint(sprint.id)}
                className="flex items-center gap-1 px-2 py-1 bg-green-600 hover:bg-green-500 text-white text-xs rounded transition-colors"
              >
                <Play size={10} />
                Start
              </button>
            )}
            {sprint.status === SprintStatus.Active && (
              <button
                onClick={() => handleCompleteSprint(sprint.id)}
                className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded transition-colors"
              >
                <CheckCircle size={10} />
                Complete
              </button>
            )}
          </div>
        </div>

        {/* Date range */}
        <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
          <span className="flex items-center gap-1">
            <Clock size={10} />
            {sprint.startDate} — {sprint.endDate}
          </span>
          <span className="flex items-center gap-1">
            <Target size={10} />
            {stats.total} tasks
          </span>
        </div>

        {/* Progress */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>{stats.done} / {stats.total} done</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-slate-800/50 rounded p-2 text-center">
            <p className="text-lg font-bold text-slate-200">{stats.inProgress}</p>
            <p className="text-[10px] text-slate-500">In Progress</p>
          </div>
          <div className="bg-slate-800/50 rounded p-2 text-center">
            <p className="text-lg font-bold text-slate-200">{stats.points}</p>
            <p className="text-[10px] text-slate-500">Total Points</p>
          </div>
          <div className="bg-slate-800/50 rounded p-2 text-center">
            <p className="text-lg font-bold text-slate-200">{stats.donePoints}</p>
            <p className="text-[10px] text-slate-500">Done Points</p>
          </div>
        </div>

        {/* Burndown placeholder */}
        {sprint.status === SprintStatus.Active && (
          <div className="mt-4 p-4 bg-slate-800/30 border border-slate-800 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={12} className="text-blue-400" />
              <span className="text-xs font-medium text-slate-400">Burndown</span>
            </div>
            <div className="h-20 flex items-end gap-1">
              {Array.from({ length: 10 }, (_, i) => {
                const height = Math.max(5, 100 - i * 10 - Math.random() * 15);
                return (
                  <div key={i} className="flex-1 bg-blue-500/30 rounded-t" style={{ height: `${height}%` }} />
                );
              })}
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-600 mt-1">
              <span>Day 1</span>
              <span>Day 10</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          <Zap size={14} className="text-yellow-400" />
          Sprint Management
        </h2>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded transition-colors"
        >
          <Plus size={12} />
          New Sprint
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3 animate-fade-in">
          <h3 className="text-sm font-medium text-slate-200">Create Sprint</h3>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Sprint name"
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <input
              type="text"
              value={newProject}
              onChange={(e) => setNewProject(e.target.value)}
              placeholder="Project ID"
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <input
            type="text"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            placeholder="Sprint goal"
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              value={newStart}
              onChange={(e) => setNewStart(e.target.value)}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 focus:outline-none focus:border-blue-500"
            />
            <input
              type="date"
              value={newEnd}
              onChange={(e) => setNewEnd(e.target.value)}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCreate}
              disabled={!newName.trim()}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-xs rounded transition-colors"
            >
              Create Sprint
            </button>
            <button onClick={() => setShowCreate(false)} className="text-xs text-slate-400 hover:text-slate-200">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Active sprints */}
      {activeSprints.length > 0 && (
        <div>
          <h3 className="text-xs text-slate-500 uppercase tracking-wide mb-3">Active ({activeSprints.length})</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {activeSprints.map(renderSprintCard)}
          </div>
        </div>
      )}

      {/* Planning sprints */}
      {planningSprints.length > 0 && (
        <div>
          <h3 className="text-xs text-slate-500 uppercase tracking-wide mb-3">Planning ({planningSprints.length})</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {planningSprints.map(renderSprintCard)}
          </div>
        </div>
      )}

      {/* Completed sprints */}
      {completedSprints.length > 0 && (
        <div>
          <h3 className="text-xs text-slate-500 uppercase tracking-wide mb-3">Completed ({completedSprints.length})</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {completedSprints.map(renderSprintCard)}
          </div>
        </div>
      )}
    </div>
  );
}
