'use client';

import { useState, useMemo } from 'react';
import { ArrowUpDown, Search } from 'lucide-react';
import { useAgentStore } from '@/store/useAgentStore';
import { AgentStatus } from '@/lib/types';
import type { Agent } from '@/lib/types';
import PixelCharacter from '@/components/office/PixelCharacter';

type SortKey = 'name' | 'role' | 'status' | 'modelTier';
type SortDir = 'asc' | 'desc';

const STATUS_DOTS: Record<AgentStatus, string> = {
  [AgentStatus.Idle]: 'bg-emerald-500',
  [AgentStatus.Working]: 'bg-yellow-500',
  [AgentStatus.Paused]: 'bg-orange-500',
  [AgentStatus.Offline]: 'bg-slate-500',
  [AgentStatus.Meeting]: 'bg-purple-500',
  [AgentStatus.Break]: 'bg-cyan-500',
};

const DEMO_AGENTS: Agent[] = [
  {
    id: '1', name: 'Alex Sterling', role: 'CEO', status: AgentStatus.Idle,
    appearance: { hair: '#2d1b00', shirt: '#1e293b', pants: '#1e293b', skin: '#fde8c9' },
    position: { x: 100, y: 120 }, providerId: 'claude_code', modelTier: 'opus', mcpConnections: [], teamId: 'exec',
  },
  {
    id: '2', name: 'Jordan Blake', role: 'Engineer', status: AgentStatus.Working,
    appearance: { hair: '#4a3728', shirt: '#3b82f6', pants: '#334155', skin: '#d4a574' },
    position: { x: 100, y: 300 }, providerId: 'claude_api', modelTier: 'sonnet', mcpConnections: ['github'], teamId: 'eng',
  },
  {
    id: '3', name: 'Casey Morgan', role: 'Engineer', status: AgentStatus.Idle,
    appearance: { hair: '#c4a35a', shirt: '#22c55e', pants: '#1e3a5f', skin: '#f5d0a9' },
    position: { x: 600, y: 300 }, providerId: 'claude_api', modelTier: 'sonnet', mcpConnections: ['github'], teamId: 'eng',
  },
  {
    id: '4', name: 'Riley Kim', role: 'Designer', status: AgentStatus.Meeting,
    appearance: { hair: '#d44', shirt: '#ec4899', pants: '#312e81', skin: '#fde8c9' },
    position: { x: 700, y: 150 }, providerId: 'gemini', modelTier: 'sonnet', mcpConnections: [], teamId: 'design',
  },
  {
    id: '5', name: 'Taylor Hayes', role: 'QA Analyst', status: AgentStatus.Paused,
    appearance: { hair: '#333', shirt: '#6b7280', pants: '#1e293b', skin: '#c68642' },
    position: { x: 600, y: 500 }, providerId: 'openai', modelTier: 'haiku', mcpConnections: [], teamId: 'eng',
  },
];

export default function AgentListView() {
  const { agents, selectAgent } = useAgentStore();
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const displayAgents = agents.length > 0 ? agents : DEMO_AGENTS;

  const filtered = useMemo(() => {
    let list = displayAgents;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.role.toLowerCase().includes(q) ||
          a.status.toLowerCase().includes(q)
      );
    }
    list = [...list].sort((a, b) => {
      const aVal = a[sortKey] ?? '';
      const bVal = b[sortKey] ?? '';
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [displayAgents, search, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const SortHeader = ({ label, sortKeyName }: { label: string; sortKeyName: SortKey }) => (
    <button
      onClick={() => toggleSort(sortKeyName)}
      className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-300 transition-colors"
    >
      {label}
      <ArrowUpDown className="w-3 h-3" />
    </button>
  );

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search agents..."
          className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Table */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="px-4 py-3 text-left">
                <SortHeader label="Agent" sortKeyName="name" />
              </th>
              <th className="px-4 py-3 text-left">
                <SortHeader label="Role" sortKeyName="role" />
              </th>
              <th className="px-4 py-3 text-left">
                <SortHeader label="Status" sortKeyName="status" />
              </th>
              <th className="px-4 py-3 text-left">
                <span className="text-xs font-medium text-slate-500">Provider</span>
              </th>
              <th className="px-4 py-3 text-left">
                <SortHeader label="Model" sortKeyName="modelTier" />
              </th>
              <th className="px-4 py-3 text-left">
                <span className="text-xs font-medium text-slate-500">MCP</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((agent) => (
              <tr
                key={agent.id}
                onClick={() => selectAgent(agent)}
                className="border-b border-slate-800/50 hover:bg-slate-800/30 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <PixelCharacter
                      appearance={agent.appearance}
                      size={24}
                      animate={false}
                    />
                    <span className="text-sm font-medium text-slate-200">
                      {agent.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-slate-400">{agent.role}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`w-2 h-2 rounded-full ${STATUS_DOTS[agent.status]}`}
                    />
                    <span className="text-sm text-slate-400 capitalize">
                      {agent.status}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
                    {agent.providerId || 'none'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-slate-400">
                    {agent.modelTier}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-slate-500">
                    {agent.mcpConnections.length > 0
                      ? agent.mcpConnections.join(', ')
                      : '-'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="p-8 text-center text-sm text-slate-600">
            No agents found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}
