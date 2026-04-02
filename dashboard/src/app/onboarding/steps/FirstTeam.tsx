'use client';

import { useState } from 'react';
import { Users2, Plus, X } from 'lucide-react';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import {
  HAIR_COLORS,
  SHIRT_COLORS,
  PANTS_COLORS,
  SKIN_COLORS,
  TEAM_COLORS,
  DEFAULT_APPEARANCE,
} from '@/lib/constants';
import { AgentStatus } from '@/lib/types';
import type { AgentConfig, AgentAppearance } from '@/lib/types';
import PixelCharacter from '@/components/office/PixelCharacter';
import AgentRolePicker from '@/components/onboarding/AgentRolePicker';

const EMOJIS = [
  '🚀', '💡', '🎯', '⚡', '🔥', '🌟', '🎮', '🛠️',
  '📊', '🎨', '🔬', '🏗️', '📱', '🤖', '🧪', '🎪',
];

function MiniColorPicker({
  selected,
  colors,
  onChange,
}: {
  selected: string;
  colors: string[];
  onChange: (c: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {colors.slice(0, 7).map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className={`w-5 h-5 rounded-sm border ${
            selected === c ? 'border-white scale-110' : 'border-transparent'
          }`}
          style={{ backgroundColor: c }}
        />
      ))}
    </div>
  );
}

function AgentCard({
  agent,
  onUpdate,
  onRemove,
  showRemove,
}: {
  agent: AgentConfig;
  onUpdate: (updates: Partial<AgentConfig>) => void;
  onRemove?: () => void;
  showRemove: boolean;
}) {
  const [showColors, setShowColors] = useState(false);

  const updateAppearance = (key: keyof AgentAppearance, value: string) => {
    onUpdate({ appearance: { ...agent.appearance, [key]: value } });
  };

  return (
    <div className="border border-slate-700 rounded-lg p-4 bg-slate-800/50">
      <div className="flex items-start gap-3">
        <button
          onClick={() => setShowColors(!showColors)}
          className="shrink-0 hover:opacity-80 transition-opacity"
        >
          <PixelCharacter appearance={agent.appearance} size={48} />
        </button>
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={agent.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              placeholder="Agent name"
              className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
            />
            {showRemove && onRemove && (
              <button
                onClick={onRemove}
                className="p-1 text-slate-500 hover:text-red-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <AgentRolePicker
            selectedRole={agent.role}
            onSelect={(roleId, roleName) =>
              onUpdate({ role: roleId, title: roleName })
            }
          />
        </div>
      </div>

      {showColors && (
        <div className="mt-3 pt-3 border-t border-slate-700 space-y-2">
          <MiniColorPicker
            selected={agent.appearance.hair}
            colors={HAIR_COLORS}
            onChange={(c) => updateAppearance('hair', c)}
          />
          <MiniColorPicker
            selected={agent.appearance.skin}
            colors={SKIN_COLORS}
            onChange={(c) => updateAppearance('skin', c)}
          />
          <MiniColorPicker
            selected={agent.appearance.shirt}
            colors={SHIRT_COLORS}
            onChange={(c) => updateAppearance('shirt', c)}
          />
          <MiniColorPicker
            selected={agent.appearance.pants}
            colors={PANTS_COLORS}
            onChange={(c) => updateAppearance('pants', c)}
          />
        </div>
      )}
    </div>
  );
}

export default function FirstTeam() {
  const { firstTeam, setFirstTeam } = useOnboardingStore();

  const addAgent = () => {
    if (firstTeam.agents.length >= 3) return;
    const newAgent: AgentConfig = {
      id: `agent-${Date.now()}`,
      name: '',
      role: 'engineer',
      title: 'Engineer',
      appearance: {
        ...DEFAULT_APPEARANCE,
        shirt: SHIRT_COLORS[firstTeam.agents.length + 2],
      },
      providerId: '',
      modelTier: 'sonnet',
      mcpConnections: [],
      status: AgentStatus.Idle,
    };
    setFirstTeam({ agents: [...firstTeam.agents, newAgent] });
  };

  const removeAgent = (id: string) => {
    setFirstTeam({
      agents: firstTeam.agents.filter((a) => a.id !== id),
    });
  };

  const updateLeader = (updates: Partial<AgentConfig>) => {
    setFirstTeam({ leader: { ...firstTeam.leader, ...updates } });
  };

  const updateAgent = (id: string, updates: Partial<AgentConfig>) => {
    setFirstTeam({
      agents: firstTeam.agents.map((a) =>
        a.id === id ? { ...a, ...updates } : a
      ),
    });
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-600/20 rounded-lg flex items-center justify-center mx-auto mb-4">
          <Users2 className="w-8 h-8 text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-100">
          Create Your First Team
        </h2>
        <p className="text-slate-400 mt-2 text-sm">
          Set up a team with a leader and some initial agents.
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Team Info */}
        <div className="grid grid-cols-[auto_1fr] gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Icon
            </label>
            <div className="flex flex-wrap gap-1 w-[140px]">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setFirstTeam({ icon: emoji })}
                  className={`w-7 h-7 rounded text-sm flex items-center justify-center hover:bg-slate-700 transition-colors ${
                    firstTeam.icon === emoji
                      ? 'bg-slate-700 ring-1 ring-blue-500'
                      : 'bg-slate-800'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Team Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={firstTeam.name}
                onChange={(e) => setFirstTeam({ name: e.target.value })}
                placeholder="Engineering Alpha"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-sm text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Description
              </label>
              <input
                type="text"
                value={firstTeam.description}
                onChange={(e) =>
                  setFirstTeam({ description: e.target.value })
                }
                placeholder="Core product development team"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-sm text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Accent Color
              </label>
              <div className="flex gap-1.5">
                {Object.entries(TEAM_COLORS).map(([name, color]) => (
                  <button
                    key={name}
                    onClick={() => setFirstTeam({ color })}
                    className={`w-6 h-6 rounded-sm border-2 transition-all ${
                      firstTeam.color === color
                        ? 'border-white scale-110'
                        : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Team Leader */}
        <div>
          <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: firstTeam.color }}
            />
            Team Leader
          </h3>
          <AgentCard
            agent={firstTeam.leader}
            onUpdate={updateLeader}
            showRemove={false}
          />
        </div>

        {/* Additional Agents */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-300">
              Team Members ({firstTeam.agents.length}/3)
            </h3>
            {firstTeam.agents.length < 3 && (
              <button
                onClick={addAgent}
                className="flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs text-slate-300 transition-colors"
              >
                <Plus className="w-3 h-3" />
                Add Agent
              </button>
            )}
          </div>

          <div className="space-y-3">
            {firstTeam.agents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onUpdate={(updates) => updateAgent(agent.id, updates)}
                onRemove={() => removeAgent(agent.id)}
                showRemove={true}
              />
            ))}

            {firstTeam.agents.length === 0 && (
              <div className="border border-dashed border-slate-700 rounded-lg p-6 text-center">
                <p className="text-sm text-slate-500">
                  No additional agents yet. Click &ldquo;Add Agent&rdquo; to add
                  team members.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
