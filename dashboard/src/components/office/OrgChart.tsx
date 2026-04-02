'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useAgentStore } from '@/store/useAgentStore';
import { useTeamStore } from '@/store/useTeamStore';
import { useProviderStore } from '@/store/useProviderStore';
import { AgentStatus } from '@/lib/types';
import PixelCharacter from './PixelCharacter';
import { DEFAULT_APPEARANCE } from '@/lib/constants';

interface OrgNode {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  appearance: typeof DEFAULT_APPEARANCE;
  provider?: string;
  currentTask?: string;
  children?: OrgNode[];
}

const STATUS_COLORS: Record<AgentStatus, string> = {
  [AgentStatus.Idle]: 'bg-emerald-500',
  [AgentStatus.Working]: 'bg-yellow-500',
  [AgentStatus.Paused]: 'bg-orange-500',
  [AgentStatus.Offline]: 'bg-slate-500',
  [AgentStatus.Meeting]: 'bg-purple-500',
  [AgentStatus.Break]: 'bg-cyan-500',
};

function OrgNodeCard({
  node,
  depth = 0,
  onSelect,
}: {
  node: OrgNode;
  depth?: number;
  onSelect: (node: OrgNode) => void;
}) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={() => onSelect(node)}
        className="bg-slate-800 border border-slate-700 rounded-lg p-3 hover:border-slate-600 hover:bg-slate-750 transition-all min-w-[140px] relative group"
      >
        <div className="flex items-center gap-2">
          <div className="shrink-0">
            <PixelCharacter appearance={node.appearance} size={28} animate={false} />
          </div>
          <div className="text-left min-w-0">
            <p className="text-xs font-bold text-slate-100 truncate">
              {node.name}
            </p>
            <p className="text-[10px] text-slate-500 truncate">{node.role}</p>
          </div>
        </div>

        {/* Status dot */}
        <div
          className={`absolute top-1 right-1 w-2 h-2 rounded-full ${STATUS_COLORS[node.status]}`}
        />

        {node.currentTask && (
          <p className="text-[9px] text-slate-600 mt-1.5 truncate max-w-[120px]">
            {node.currentTask}
          </p>
        )}

        {node.provider && (
          <span className="text-[8px] text-slate-600 bg-slate-900 px-1 rounded mt-1 inline-block">
            {node.provider}
          </span>
        )}
      </button>

      {/* Expand/collapse for children */}
      {hasChildren && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-1 p-0.5 text-slate-600 hover:text-slate-400 transition-colors"
        >
          {expanded ? (
            <ChevronDown className="w-3 h-3" />
          ) : (
            <ChevronRight className="w-3 h-3" />
          )}
        </button>
      )}

      {/* Connector line */}
      {hasChildren && expanded && (
        <>
          <div className="w-px h-4 bg-slate-700" />
          <div className="flex gap-6 items-start">
            {node.children!.map((child, i) => (
              <div key={child.id} className="flex flex-col items-center relative">
                {/* Horizontal connector */}
                {node.children!.length > 1 && (
                  <div
                    className="absolute -top-0.5 h-px bg-slate-700"
                    style={{
                      left: i === 0 ? '50%' : 0,
                      right: i === node.children!.length - 1 ? '50%' : 0,
                    }}
                  />
                )}
                {/* Vertical connector to child */}
                <div className="w-px h-4 bg-slate-700" />
                <OrgNodeCard node={child} depth={depth + 1} onSelect={onSelect} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function OrgChart() {
  const { agents, selectAgent } = useAgentStore();
  const teams = useTeamStore((s) => s.teams);
  const providers = useProviderStore((s) => s.providers);
  const [selectedNode, setSelectedNode] = useState<OrgNode | null>(null);

  const getProviderLabel = (providerId: string, modelTier: string): string => {
    const prov = providers.find((p) => p.id === providerId);
    const provName = prov?.name ?? providerId;
    return modelTier ? `${provName} (${modelTier})` : provName;
  };

  // Build org tree from real data
  const ceo = agents.find((a) => a.role === 'CEO');
  const executives = agents.filter((a) =>
    a.teamId === 'executive-office' && a.role !== 'CEO'
  );
  const nonExecAgents = agents.filter((a) =>
    a.teamId !== 'executive-office'
  );

  // Group non-exec agents by team
  const teamGroups = new Map<string, typeof agents>();
  for (const agent of nonExecAgents) {
    const key = agent.teamId || 'unassigned';
    const group = teamGroups.get(key) ?? [];
    group.push(agent);
    teamGroups.set(key, group);
  }

  // Build children for each executive - match teams to execs loosely
  const execNodes: OrgNode[] = executives.map((exec) => {
    // Find teams that this executive might oversee
    const teamChildren: OrgNode[] = [];

    teamGroups.forEach((teamAgents, teamId) => {
      if (teamAgents.length === 0) return;

      // First agent in each team is the leader
      const leader = teamAgents[0];
      const members = teamAgents.slice(1);

      teamChildren.push({
        id: leader.id,
        name: leader.name,
        role: leader.role,
        status: leader.status,
        appearance: leader.appearance,
        provider: getProviderLabel(leader.providerId, leader.modelTier),
        children: members.map((m) => ({
          id: m.id,
          name: m.name,
          role: m.role,
          status: m.status,
          appearance: m.appearance,
          provider: getProviderLabel(m.providerId, m.modelTier),
        })),
      });
    });

    return {
      id: exec.id,
      name: exec.name,
      role: exec.role,
      status: exec.status,
      appearance: exec.appearance,
      provider: getProviderLabel(exec.providerId, exec.modelTier),
      children: teamChildren,
    };
  });

  // If there are no executives, attach team groups directly under CEO
  const ceoChildren: OrgNode[] = execNodes.length > 0
    ? execNodes
    : Array.from(teamGroups.entries()).reduce<OrgNode[]>((acc, [, teamAgents]) => {
        const leader = teamAgents[0];
        if (!leader) return acc;
        const members = teamAgents.slice(1);
        acc.push({
          id: leader.id,
          name: leader.name,
          role: leader.role,
          status: leader.status,
          appearance: leader.appearance,
          provider: getProviderLabel(leader.providerId, leader.modelTier),
          children: members.map((m) => ({
            id: m.id,
            name: m.name,
            role: m.role,
            status: m.status,
            appearance: m.appearance,
            provider: getProviderLabel(m.providerId, m.modelTier),
          })),
        });
        return acc;
      }, []);

  // Distribute team groups among executives (round-robin if multiple)
  // Already handled above — executives get all team children since we don't have explicit mapping

  const orgTree: OrgNode = {
    id: ceo?.id ?? 'ceo',
    name: ceo?.name ?? 'CEO',
    role: 'CEO',
    status: ceo?.status ?? AgentStatus.Idle,
    appearance: ceo?.appearance ?? DEFAULT_APPEARANCE,
    provider: ceo ? getProviderLabel(ceo.providerId, ceo.modelTier) : undefined,
    children: ceoChildren.length > 0 ? ceoChildren : undefined,
  };

  return (
    <div className="w-full overflow-auto">
      <div className="min-w-[600px] p-8 flex flex-col items-center">
        <OrgNodeCard node={orgTree} onSelect={(node) => {
          setSelectedNode(node);
          // Also select the agent in the store if it exists
          const agent = agents.find((a) => a.id === node.id);
          if (agent) selectAgent(agent);
        }} />
      </div>

      {/* Detail Panel */}
      {selectedNode && (
        <div className="fixed bottom-4 right-4 w-72 bg-slate-800 border border-slate-700 rounded-lg p-4 shadow-xl animate-slide-in-right z-50">
          <div className="flex items-start gap-3">
            <PixelCharacter appearance={selectedNode.appearance} size={48} />
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm text-slate-100">
                {selectedNode.name}
              </h3>
              <p className="text-xs text-slate-400">{selectedNode.role}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <div
                  className={`w-2 h-2 rounded-full ${STATUS_COLORS[selectedNode.status]}`}
                />
                <span className="text-[10px] text-slate-500 capitalize">
                  {selectedNode.status}
                </span>
              </div>
              {selectedNode.currentTask && (
                <p className="text-[11px] text-slate-500 mt-2">
                  Current: {selectedNode.currentTask}
                </p>
              )}
              {selectedNode.provider && (
                <span className="text-[10px] text-slate-600 bg-slate-900 px-1.5 py-0.5 rounded mt-2 inline-block">
                  {selectedNode.provider}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => setSelectedNode(null)}
            className="absolute top-2 right-2 text-slate-600 hover:text-slate-400 text-xs"
          >
            x
          </button>
        </div>
      )}
    </div>
  );
}
