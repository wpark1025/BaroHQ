'use client';

import { useState, useMemo } from 'react';
import { ArrowUpDown, Search } from 'lucide-react';
import { useAgentStore } from '@/store/useAgentStore';
import { useProviderStore } from '@/store/useProviderStore';
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

export default function AgentListView() {
  const { agents, selectAgent, selectedTeam } = useAgentStore();
  const providers = useProviderStore((s) => s.providers);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  // Filter by selected team
  const teamFiltered = useMemo(() => {
    if (!selectedTeam) return agents;
    return agents.filter((a) => a.teamId === selectedTeam);
  }, [agents, selectedTeam]);

  const filtered = useMemo(() => {
    let list = teamFiltered;
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
  }, [teamFiltered, search, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const getProviderName = (providerId: string): string => {
    const p = providers.find((prov) => prov.id === providerId);
    return p?.name ?? (providerId || 'none');
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
                    {getProviderName(agent.providerId)}
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
            {agents.length === 0
              ? 'No agents yet. Complete onboarding to get started.'
              : 'No agents found matching your search.'}
          </div>
        )}
      </div>
    </div>
  );
}
