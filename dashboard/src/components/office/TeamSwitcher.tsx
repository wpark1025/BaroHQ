'use client';

import { useCallback } from 'react';
import { Plus, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import PixelCharacter from './PixelCharacter';
import { DEFAULT_APPEARANCE } from '@/lib/constants';
import { useAgentStore } from '@/store/useAgentStore';
import { useTeamStore } from '@/store/useTeamStore';

interface TeamPillDisplay {
  id: string;
  name: string;
  abbreviation: string;
  accent: string;
}

export default function TeamSwitcher() {
  const router = useRouter();
  const { selectedTeam, setSelectedTeam } = useAgentStore();
  const teams = useTeamStore((s) => s.teams);

  // Build display pills from store teams
  const teamPills: TeamPillDisplay[] = teams.map((team) => ({
    id: team.id,
    name: team.name,
    abbreviation: team.name.slice(0, 2).toUpperCase(),
    accent: team.accent || '#3b82f6',
  }));

  const handleTeamClick = useCallback((teamId: string) => {
    // Toggle: click same team deselects (show all)
    if (selectedTeam === teamId) {
      setSelectedTeam(null);
    } else {
      setSelectedTeam(teamId);
    }
  }, [selectedTeam, setSelectedTeam]);

  // Get CEO appearance from agents if available
  const ceoAgent = useAgentStore((s) => s.agents.find((a) => a.role === 'CEO'));
  const ceoAppearance = ceoAgent?.appearance ?? DEFAULT_APPEARANCE;

  return (
    <div className="w-[52px] bg-slate-900 border-r border-slate-800 flex flex-col items-center py-3 gap-2 shrink-0">
      {/* Logo - click to show all teams */}
      <button
        onClick={() => setSelectedTeam(null)}
        className="w-9 h-9 bg-blue-600 rounded-sm flex items-center justify-center mb-2 cursor-pointer hover:bg-blue-500 transition-colors"
        title="Show all teams"
      >
        <span className="text-white font-black text-sm">B</span>
      </button>

      <div className="w-6 h-px bg-slate-700 mb-1" />

      {/* Team Pills */}
      {teamPills.map((team) => {
        const isActive = selectedTeam === team.id;
        return (
          <button
            key={team.id}
            onClick={() => handleTeamClick(team.id)}
            title={team.name}
            className={`
              w-9 h-9 rounded-sm flex items-center justify-center text-xs font-bold
              transition-all relative
              ${
                isActive
                  ? 'bg-slate-700 text-white shadow-lg ring-2 ring-offset-1 ring-offset-slate-900'
                  : 'bg-slate-800 text-slate-500 hover:bg-slate-750 hover:text-slate-300'
              }
            `}
            style={{
              borderLeft: isActive
                ? `3px solid ${team.accent}`
                : '3px solid transparent',
              ...(isActive
                ? { boxShadow: `0 0 8px ${team.accent}40` }
                : {}),
            }}
          >
            {team.abbreviation}
          </button>
        );
      })}

      {/* Empty state when no teams */}
      {teamPills.length === 0 && (
        <div className="w-9 h-9 rounded-sm border border-dashed border-slate-800 flex items-center justify-center">
          <span className="text-[8px] text-slate-700">--</span>
        </div>
      )}

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
        onClick={() => router.push('/settings')}
        className="w-9 h-9 rounded-sm flex items-center justify-center text-slate-600 hover:text-slate-300 hover:bg-slate-800 transition-colors"
      >
        <Settings className="w-4 h-4" />
      </button>

      {/* CEO Avatar */}
      <div className="mt-1 cursor-pointer hover:opacity-80 transition-opacity" title={ceoAgent?.name ?? 'CEO'}>
        <PixelCharacter appearance={ceoAppearance} size={28} animate={false} />
      </div>
    </div>
  );
}
