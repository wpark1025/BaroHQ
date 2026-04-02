'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { TEAM_COLORS, DEFAULT_APPEARANCE } from '@/lib/constants';
import { AgentStatus } from '@/lib/types';
import type { AgentConfig, AgentAppearance } from '@/lib/types';
import PixelCharacter from '@/components/office/PixelCharacter';

interface AddTeamModalProps {
  onSubmit: (team: {
    name: string;
    icon: string;
    description: string;
    color: string;
    leader: AgentConfig;
  }) => void;
  onClose: () => void;
}

const EMOJIS = [
  '🚀', '💡', '🎯', '⚡', '🔥', '🌟', '🎮', '🛠️',
  '📊', '🎨', '🔬', '🏗️', '📱', '🤖', '🧪', '🎪',
];

export default function AddTeamModal({ onSubmit, onClose }: AddTeamModalProps) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🚀');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [leaderName, setLeaderName] = useState('');
  const [leaderAppearance, setLeaderAppearance] = useState<AgentAppearance>({
    ...DEFAULT_APPEARANCE,
  });

  const handleSubmit = () => {
    if (!name) return;

    onSubmit({
      name,
      icon,
      description,
      color,
      leader: {
        id: `leader-${Date.now()}`,
        name: leaderName || `${name} Lead`,
        role: 'Team Lead',
        title: 'Team Lead',
        appearance: leaderAppearance,
        providerId: '',
        modelTier: 'sonnet',
        mcpConnections: [],
        status: AgentStatus.Idle,
      },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h2 className="text-lg font-bold text-slate-100">New Team</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Team Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Engineering Beta"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Icon
            </label>
            <div className="flex flex-wrap gap-1">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => setIcon(e)}
                  className={`w-7 h-7 rounded text-sm flex items-center justify-center ${
                    icon === e
                      ? 'bg-slate-700 ring-1 ring-blue-500'
                      : 'bg-slate-800 hover:bg-slate-700'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this team do?"
              rows={2}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(TEAM_COLORS).map(([key, c]) => (
                <button
                  key={key}
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-sm border-2 transition-all ${
                    color === c
                      ? 'border-white scale-110'
                      : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Team Leader */}
          <div className="pt-3 border-t border-slate-800">
            <label className="block text-xs font-bold text-slate-300 mb-2">
              Team Leader
            </label>
            <div className="flex items-center gap-3">
              <PixelCharacter
                appearance={leaderAppearance}
                size={40}
                animate={false}
              />
              <input
                type="text"
                value={leaderName}
                onChange={(e) => setLeaderName(e.target.value)}
                placeholder="Leader name"
                className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-sm transition-colors disabled:opacity-40"
          >
            Create Team
          </button>
        </div>
      </div>
    </div>
  );
}
