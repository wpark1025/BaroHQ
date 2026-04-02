'use client';

import { useState } from 'react';
import { Plus, Settings } from 'lucide-react';
import PixelCharacter from './PixelCharacter';
import { DEFAULT_APPEARANCE } from '@/lib/constants';

interface TeamPill {
  id: string;
  name: string;
  abbreviation: string;
  accent: string;
}

export default function TeamSwitcher() {
  const [activeTeam, setActiveTeam] = useState<string>('');
  const [teams] = useState<TeamPill[]>([
    { id: 'exec', name: 'Executive', abbreviation: 'EX', accent: '#eab308' },
    { id: 'eng', name: 'Engineering', abbreviation: 'EN', accent: '#3b82f6' },
    { id: 'design', name: 'Design', abbreviation: 'DE', accent: '#ec4899' },
  ]);

  return (
    <div className="w-[52px] bg-slate-900 border-r border-slate-800 flex flex-col items-center py-3 gap-2 shrink-0">
      {/* Logo */}
      <div className="w-9 h-9 bg-blue-600 rounded-sm flex items-center justify-center mb-2 cursor-pointer hover:bg-blue-500 transition-colors">
        <span className="text-white font-black text-sm">B</span>
      </div>

      <div className="w-6 h-px bg-slate-700 mb-1" />

      {/* Team Pills */}
      {teams.map((team) => {
        const isActive = activeTeam === team.id;
        return (
          <button
            key={team.id}
            onClick={() => setActiveTeam(team.id)}
            title={team.name}
            className={`
              w-9 h-9 rounded-sm flex items-center justify-center text-xs font-bold
              transition-all relative
              ${
                isActive
                  ? 'bg-slate-700 text-white shadow-lg'
                  : 'bg-slate-800 text-slate-500 hover:bg-slate-750 hover:text-slate-300'
              }
            `}
            style={{
              borderLeft: isActive ? `3px solid ${team.accent}` : '3px solid transparent',
            }}
          >
            {team.abbreviation}
          </button>
        );
      })}

      {/* Add Team */}
      <button
        title="Add Team"
        className="w-9 h-9 rounded-sm border border-dashed border-slate-700 flex items-center justify-center text-slate-600 hover:text-slate-400 hover:border-slate-600 transition-colors"
      >
        <Plus className="w-4 h-4" />
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Settings */}
      <button
        title="Settings"
        className="w-9 h-9 rounded-sm flex items-center justify-center text-slate-600 hover:text-slate-300 hover:bg-slate-800 transition-colors"
      >
        <Settings className="w-4 h-4" />
      </button>

      {/* CEO Avatar */}
      <div className="mt-1 cursor-pointer hover:opacity-80 transition-opacity" title="CEO">
        <PixelCharacter appearance={DEFAULT_APPEARANCE} size={28} animate={false} />
      </div>
    </div>
  );
}
