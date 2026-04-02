'use client';

import { X, Cpu, Plug, Users } from 'lucide-react';
import { useAgentStore } from '@/store/useAgentStore';
import { useProviderStore } from '@/store/useProviderStore';
import { AgentStatus } from '@/lib/types';
import PixelCharacter from '@/components/office/PixelCharacter';

const STATUS_COLORS: Record<AgentStatus, { dot: string; label: string }> = {
  [AgentStatus.Idle]: { dot: 'bg-emerald-500', label: 'Idle' },
  [AgentStatus.Working]: { dot: 'bg-yellow-500', label: 'Working' },
  [AgentStatus.Paused]: { dot: 'bg-orange-500', label: 'Paused' },
  [AgentStatus.Offline]: { dot: 'bg-slate-500', label: 'Offline' },
  [AgentStatus.Meeting]: { dot: 'bg-purple-500', label: 'In Meeting' },
  [AgentStatus.Break]: { dot: 'bg-cyan-500', label: 'On Break' },
};

export default function AgentDetailPanel() {
  const { selectedAgent, selectAgent } = useAgentStore();
  const providers = useProviderStore((s) => s.providers);

  if (!selectedAgent) return null;

  const provider = providers.find((p) => p.id === selectedAgent.providerId);
  const statusConfig = STATUS_COLORS[selectedAgent.status] ?? STATUS_COLORS[AgentStatus.Offline];

  return (
    <div className="w-[240px] bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800">
        <span className="text-xs font-bold text-slate-300">Agent Detail</span>
        <button
          onClick={() => selectAgent(null)}
          className="text-slate-600 hover:text-slate-400 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Agent Info */}
      <div className="p-4 space-y-4">
        {/* Avatar and Name */}
        <div className="flex flex-col items-center text-center gap-2">
          <PixelCharacter
            appearance={selectedAgent.appearance}
            size={48}
            animate={false}
          />
          <div>
            <p className="text-sm font-bold text-slate-200">{selectedAgent.name}</p>
            <p className="text-xs text-slate-500">{selectedAgent.role}</p>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded">
          <div className={`w-2 h-2 rounded-full ${statusConfig.dot}`} />
          <span className="text-xs text-slate-300">{statusConfig.label}</span>
        </div>

        {/* Provider */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Cpu className="w-3 h-3" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Provider</span>
          </div>
          <div className="px-3 py-2 bg-slate-800 rounded">
            <p className="text-xs text-slate-300">
              {provider?.name ?? (selectedAgent.providerId || 'Not assigned')}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Model tier: {selectedAgent.modelTier}
            </p>
          </div>
        </div>

        {/* MCP Connections */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Plug className="w-3 h-3" />
            <span className="text-[10px] font-bold uppercase tracking-wider">MCP Connections</span>
          </div>
          <div className="px-3 py-2 bg-slate-800 rounded">
            {selectedAgent.mcpConnections.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {selectedAgent.mcpConnections.map((mcp) => (
                  <span
                    key={mcp}
                    className="px-1.5 py-0.5 bg-slate-700 rounded text-[10px] text-slate-400"
                  >
                    {mcp}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-slate-600">No connections</p>
            )}
          </div>
        </div>

        {/* Team */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Users className="w-3 h-3" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Team</span>
          </div>
          <div className="px-3 py-2 bg-slate-800 rounded">
            <p className="text-xs text-slate-300">{selectedAgent.teamId || 'Unassigned'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
