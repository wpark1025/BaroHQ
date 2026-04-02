'use client';

import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useProjectStore } from '@/store/projectStore';
import { ProjectStatus, ProjectPriority } from '@/lib/types';

interface AddProjectModalProps {
  onClose: () => void;
}

export function AddProjectModal({ onClose }: AddProjectModalProps) {
  const addProject = useProjectStore((s) => s.addProject);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<ProjectPriority>(ProjectPriority.Medium);
  const [teams, setTeams] = useState<string[]>([]);
  const [teamInput, setTeamInput] = useState('');
  const [owner, setOwner] = useState('');
  const [startDate, setStartDate] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [milestones, setMilestones] = useState<{ name: string; date: string }[]>([]);
  const [msName, setMsName] = useState('');
  const [msDate, setMsDate] = useState('');

  const handleNameChange = (val: string) => {
    setName(val);
    if (!slug || slug === name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')) {
      setSlug(val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
    }
  };

  const addTeam = () => {
    if (teamInput && !teams.includes(teamInput)) {
      setTeams([...teams, teamInput]);
      setTeamInput('');
    }
  };

  const addMilestone = () => {
    if (msName && msDate) {
      setMilestones([...milestones, { name: msName, date: msDate }]);
      setMsName('');
      setMsDate('');
    }
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    const now = new Date().toISOString();
    addProject({
      id: `proj-${Date.now()}`,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      name,
      description,
      status: ProjectStatus.Planning,
      priority,
      owner: owner || 'unassigned',
      teams,
      teamLeads: {},
      goals: [],
      sprints: [],
      budget: 0,
      timeline: {
        startDate: startDate || now.split('T')[0],
        endDate: targetDate || '',
        milestones: milestones.map((ms, i) => ({
          id: `ms-new-${i}`,
          name: ms.name,
          date: ms.date,
          status: 'pending',
        })),
      },
      git: { repo: '', branch: 'main', lastCommit: '' },
      channels: [],
      tags: [],
      createdBy: 'current-user',
      createdAt: now,
      updatedAt: now,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-slate-100">New Project</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Project Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="My Awesome Project"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="my-awesome-project"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What is this project about?"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as ProjectPriority)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value={ProjectPriority.Critical}>Critical</option>
                <option value={ProjectPriority.High}>High</option>
                <option value={ProjectPriority.Medium}>Medium</option>
                <option value={ProjectPriority.Low}>Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Owner</label>
              <input
                type="text"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                placeholder="Agent or user ID"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Teams */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Teams</label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={teamInput}
                onChange={(e) => setTeamInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTeam())}
                placeholder="Team ID"
                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={addTeam}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-sm transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
            {teams.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {teams.map((t) => (
                  <span key={t} className="flex items-center gap-1 px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded">
                    {t}
                    <button onClick={() => setTeams(teams.filter((x) => x !== t))} className="text-slate-500 hover:text-slate-300">
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Target Date</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Milestones */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Milestones</label>
            {milestones.map((ms, i) => (
              <div key={i} className="flex items-center gap-2 mb-2 p-2 bg-slate-800 rounded text-sm text-slate-300">
                <span className="flex-1">{ms.name}</span>
                <span className="text-slate-500">{ms.date}</span>
                <button
                  onClick={() => setMilestones(milestones.filter((_, j) => j !== i))}
                  className="text-slate-500 hover:text-red-400"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={msName}
                onChange={(e) => setMsName(e.target.value)}
                placeholder="Milestone name"
                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <input
                type="date"
                value={msDate}
                onChange={(e) => setMsDate(e.target.value)}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={addMilestone}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-sm transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-medium rounded transition-colors"
          >
            Create Project
          </button>
        </div>
      </div>
    </div>
  );
}
