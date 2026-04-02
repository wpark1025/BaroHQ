'use client';

import { useState } from 'react';
import { Save, Trash2, Archive } from 'lucide-react';
import { TEAM_COLORS } from '@/lib/constants';
import type { Team } from '@/lib/types';

interface TeamSettingsProps {
  team: Team;
  onSave: (updates: Partial<Team>) => void;
  onDelete: (teamId: string) => void;
  onClose: () => void;
}

export default function TeamSettings({
  team,
  onSave,
  onDelete,
  onClose,
}: TeamSettingsProps) {
  const [name, setName] = useState(team.name);
  const [description, setDescription] = useState(team.description);
  const [accent, setAccent] = useState(team.accent);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSave = () => {
    onSave({ name, description, accent });
    onClose();
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-5 max-w-md w-full">
      <h2 className="text-lg font-bold text-slate-100 mb-4">Team Settings</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Team Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            Accent Color
          </label>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(TEAM_COLORS).map(([key, color]) => (
              <button
                key={key}
                onClick={() => setAccent(color)}
                className={`w-7 h-7 rounded-sm border-2 transition-all hover:scale-110 ${
                  accent === color
                    ? 'border-white scale-110'
                    : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-800">
        <div className="flex gap-2">
          <button
            onClick={() =>
              confirmDelete ? onDelete(team.id) : setConfirmDelete(true)
            }
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              confirmDelete
                ? 'bg-red-600 text-white hover:bg-red-500'
                : 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
            }`}
          >
            <Trash2 className="w-3 h-3" />
            {confirmDelete ? 'Confirm Delete' : 'Delete'}
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors">
            <Archive className="w-3 h-3" />
            Archive
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded transition-colors"
          >
            <Save className="w-3 h-3" />
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
