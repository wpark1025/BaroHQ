'use client';

import { useState } from 'react';
import { Server, Check } from 'lucide-react';
import { useMcpStore } from '@/store/mcpStore';

interface McpAgentAssignProps {
  agentIds?: string[];
  teamIds?: string[];
  onAssign?: (connectionId: string, agentIds: string[], teamIds: string[]) => void;
}

const MOCK_AGENTS = [
  { id: 'agent-1', name: 'Lead Engineer', team: 'team-eng' },
  { id: 'agent-2', name: 'Backend Dev', team: 'team-eng' },
  { id: 'agent-3', name: 'Designer', team: 'team-design' },
  { id: 'agent-4', name: 'Security Agent', team: 'team-eng' },
  { id: 'agent-ceo', name: 'CEO', team: 'executive' },
];

const MOCK_TEAMS = [
  { id: 'team-eng', name: 'Engineering' },
  { id: 'team-design', name: 'Design' },
  { id: 'team-ops', name: 'Operations' },
];

export function McpAgentAssign({ onAssign }: McpAgentAssignProps) {
  const connections = useMcpStore((s) => s.connections);
  const [selectedConnection, setSelectedConnection] = useState(connections[0]?.id || '');
  const [selectedAgents, setSelectedAgents] = useState<Set<string>>(new Set());
  const [selectedTeams, setSelectedTeams] = useState<Set<string>>(new Set());

  const toggleAgent = (id: string) => {
    const next = new Set(selectedAgents);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedAgents(next);
  };

  const toggleTeam = (id: string) => {
    const next = new Set(selectedTeams);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedTeams(next);
  };

  const handleAssign = () => {
    if (onAssign && selectedConnection) {
      onAssign(selectedConnection, Array.from(selectedAgents), Array.from(selectedTeams));
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
      <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
        <Server size={14} className="text-blue-400" />
        Assign MCP Connections
      </h3>

      {/* Connection selector */}
      <div>
        <label className="block text-xs text-slate-500 uppercase tracking-wide mb-1">Connection</label>
        <select
          value={selectedConnection}
          onChange={(e) => setSelectedConnection(e.target.value)}
          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 focus:outline-none focus:border-blue-500"
        >
          {connections.map((c) => (
            <option key={c.id} value={c.id}>{c.name} ({c.tools.length} tools)</option>
          ))}
        </select>
      </div>

      {/* Teams checklist */}
      <div>
        <label className="block text-xs text-slate-500 uppercase tracking-wide mb-2">Teams</label>
        <div className="space-y-1">
          {MOCK_TEAMS.map((team) => (
            <label
              key={team.id}
              className="flex items-center gap-3 p-2 rounded hover:bg-slate-800/50 cursor-pointer transition-colors"
            >
              <div
                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                  selectedTeams.has(team.id) ? 'bg-blue-600 border-blue-500' : 'border-slate-600 bg-slate-800'
                }`}
                onClick={() => toggleTeam(team.id)}
              >
                {selectedTeams.has(team.id) && <Check size={10} className="text-white" />}
              </div>
              <span className="text-sm text-slate-300">{team.name}</span>
              <span className="text-[10px] text-slate-500 ml-auto">{team.id}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Agents checklist */}
      <div>
        <label className="block text-xs text-slate-500 uppercase tracking-wide mb-2">Agents</label>
        <div className="space-y-1">
          {MOCK_AGENTS.map((agent) => (
            <label
              key={agent.id}
              className="flex items-center gap-3 p-2 rounded hover:bg-slate-800/50 cursor-pointer transition-colors"
            >
              <div
                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                  selectedAgents.has(agent.id) ? 'bg-blue-600 border-blue-500' : 'border-slate-600 bg-slate-800'
                }`}
                onClick={() => toggleAgent(agent.id)}
              >
                {selectedAgents.has(agent.id) && <Check size={10} className="text-white" />}
              </div>
              <div className="flex-1">
                <span className="text-sm text-slate-300">{agent.name}</span>
                <span className="text-[10px] text-slate-500 ml-2">{agent.team}</span>
              </div>
              <span className="text-[10px] text-slate-500">{agent.id}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={handleAssign}
        disabled={selectedAgents.size === 0 && selectedTeams.size === 0}
        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-medium rounded transition-colors"
      >
        Assign ({selectedAgents.size + selectedTeams.size} selected)
      </button>
    </div>
  );
}
