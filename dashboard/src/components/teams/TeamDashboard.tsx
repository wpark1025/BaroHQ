'use client';

import { Users, FolderKanban, Gauge, Zap } from 'lucide-react';
import type { Team } from '@/lib/types';
import { useAgentStore } from '@/store/useAgentStore';
import { useProjectStore } from '@/store/useProjectStore';
import { AgentStatus } from '@/lib/types';
import PixelCharacter from '@/components/office/PixelCharacter';

interface TeamDashboardProps {
  team: Team;
}

const STATUS_DOTS: Record<AgentStatus, string> = {
  [AgentStatus.Idle]: 'bg-emerald-500',
  [AgentStatus.Working]: 'bg-yellow-500',
  [AgentStatus.Paused]: 'bg-orange-500',
  [AgentStatus.Offline]: 'bg-slate-500',
  [AgentStatus.Meeting]: 'bg-purple-500',
  [AgentStatus.Break]: 'bg-cyan-500',
};

export default function TeamDashboard({ team }: TeamDashboardProps) {
  const { agents } = useAgentStore();
  const { projects, sprints } = useProjectStore();

  const teamAgents = agents.filter((a) => a.teamId === team.id);
  const teamProjects = projects.filter((p) => p.teams.includes(team.id));
  const activeSprints = sprints.filter(
    (s) =>
      s.status === 'active' &&
      teamProjects.some((p) => p.id === s.project)
  );

  const workingCount = teamAgents.filter(
    (a) => a.status === AgentStatus.Working
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="text-2xl">{team.icon}</span>
        <div>
          <h2 className="text-lg font-bold text-slate-100">{team.name}</h2>
          <p className="text-xs text-slate-500">{team.description}</p>
        </div>
        <div
          className="ml-auto w-3 h-3 rounded-full"
          style={{ backgroundColor: team.accent }}
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs text-slate-500">Members</span>
          </div>
          <p className="text-xl font-bold text-slate-100">
            {teamAgents.length}
          </p>
          <p className="text-[10px] text-slate-600">
            {workingCount} active
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <FolderKanban className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-xs text-slate-500">Projects</span>
          </div>
          <p className="text-xl font-bold text-slate-100">
            {teamProjects.length}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Gauge className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs text-slate-500">Sprint</span>
          </div>
          <p className="text-xl font-bold text-slate-100">
            {activeSprints.length}
          </p>
          <p className="text-[10px] text-slate-600">active</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs text-slate-500">Velocity</span>
          </div>
          <p className="text-xl font-bold text-slate-100">
            {activeSprints[0]?.velocity ?? 0}
          </p>
          <p className="text-[10px] text-slate-600">pts/sprint</p>
        </div>
      </div>

      {/* Member List */}
      <div>
        <h3 className="text-sm font-bold text-slate-300 mb-3">Members</h3>
        <div className="space-y-1.5">
          {teamAgents.map((agent) => (
            <div
              key={agent.id}
              className="flex items-center gap-3 p-2 bg-slate-900/50 border border-slate-800/50 rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              <PixelCharacter
                appearance={agent.appearance}
                size={24}
                animate={false}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">
                  {agent.name}
                </p>
                <p className="text-[10px] text-slate-500">{agent.role}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-2 h-2 rounded-full ${STATUS_DOTS[agent.status]}`}
                />
                <span className="text-[10px] text-slate-500 capitalize">
                  {agent.status}
                </span>
              </div>
            </div>
          ))}

          {teamAgents.length === 0 && (
            <p className="text-sm text-slate-600 text-center py-4">
              No agents in this team yet.
            </p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs text-slate-300 transition-colors">
          Add Member
        </button>
        <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs text-slate-300 transition-colors">
          New Project
        </button>
        <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs text-slate-300 transition-colors">
          Start Sprint
        </button>
      </div>
    </div>
  );
}
