'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useAgentStore } from '@/store/useAgentStore';
import { useTeamStore } from '@/store/useTeamStore';
import { useProviderStore } from '@/store/useProviderStore';
import { useProjectStore } from '@/store/useProjectStore';
import { NODE_POSITIONS } from '@/lib/constants';
import type { Agent, Team, Provider, PlatformConfig, AgentConfig } from '@/lib/types';
import { AgentStatus } from '@/lib/types';
import TeamSwitcher from '@/components/office/TeamSwitcher';
import ProjectSidebar from '@/components/common/ProjectSidebar';
import Header from '@/components/common/Header';
import OfficeFloor from '@/components/office/OfficeFloor';
import AgentListView from '@/components/agents/AgentListView';
import OrgChart from '@/components/office/OrgChart';
import ChatPanel from '@/components/chat/ChatPanel';
import ViewTabs from '@/components/common/ViewTabs';
import AgentDetailPanel from '@/components/agents/AgentDetailPanel';

const VIEW_TABS = [
  { id: 'office', label: 'Office' },
  { id: 'list', label: 'List' },
  { id: 'org', label: 'Org Chart' },
];

/** Desk positions to place agents on the office floor */
const DESK_NODES = NODE_POSITIONS.filter((n) => n.id.startsWith('desk_'));

interface ApiStateResponse {
  teams: Team[];
  agents: AgentConfig[];
  providers: Provider[];
  projects: { id: string; slug: string; name: string; description: string; status: string; priority: string; owner: string; teams: string[]; teamLeads: Record<string, string>; goals: string[]; sprints: string[]; budget: number; timeline: { startDate: string; endDate: string; milestones: { id: string; name: string; date: string; status: string }[] }; git: { repo: string; branch: string; lastCommit: string }; channels: string[]; tags: string[]; createdBy: string; createdAt: string; updatedAt: string }[];
  config: PlatformConfig;
}

function agentConfigToAgent(
  cfg: AgentConfig,
  teamId: string,
  deskIndex: number,
): Agent {
  const desk = DESK_NODES[deskIndex % DESK_NODES.length] ?? { x: 400, y: 400 };
  return {
    id: cfg.id,
    name: cfg.name,
    role: cfg.role || cfg.title || 'Agent',
    status: cfg.status ?? AgentStatus.Idle,
    appearance: cfg.appearance,
    position: { x: desk.x, y: desk.y },
    providerId: cfg.providerId ?? '',
    modelTier: cfg.modelTier ?? '',
    mcpConnections: cfg.mcpConnections ?? [],
    teamId,
  };
}

export default function OfficePage() {
  const { connected, send } = useWebSocket();
  const router = useRouter();
  const [activeView, setActiveView] = useState('office');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chatCollapsed, setChatCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const selectedAgent = useAgentStore((s) => s.selectedAgent);

  const setAgents = useAgentStore((s) => s.setAgents);
  const setTeams = useTeamStore((s) => s.setTeams);
  const setProviders = useProviderStore((s) => s.setProviders);
  const setProjects = useProjectStore((s) => s.setProjects);

  const loadData = useCallback(async () => {
    // Step 1: Check config for onboarding status
    try {
      const configRes = await fetch('/api/config', { cache: 'no-store' });
      if (configRes.ok) {
        const config = await configRes.json() as PlatformConfig;
        if (!config.onboardingComplete) {
          router.replace('/onboarding');
          return;
        }
      } else {
        // API not available yet, allow render
      }
    } catch {
      // API not available, allow page to render
    }

    // Step 2: Load full state from /api/state
    try {
      const stateRes = await fetch('/api/state', { cache: 'no-store' });
      if (stateRes.ok) {
        const data = await stateRes.json() as ApiStateResponse;

        // Populate team store
        if (data.teams) {
          setTeams(data.teams);
        }

        // Populate provider store
        if (data.providers) {
          setProviders(data.providers);
        }

        // Populate project store
        if (data.projects) {
          setProjects(data.projects as Parameters<typeof setProjects>[0]);
        }

        // Build agents from teams and agent configs
        const allAgents: Agent[] = [];
        let deskIdx = 0;

        // If config has CEO, add as agent
        if (data.config?.ceo) {
          allAgents.push(
            agentConfigToAgent(data.config.ceo, 'executive-office', deskIdx++),
          );
        }

        // Add executives
        if (data.config?.executives) {
          for (const exec of data.config.executives) {
            allAgents.push(
              agentConfigToAgent(exec, 'executive-office', deskIdx++),
            );
          }
        }

        // Add team agents from /api/state agents list
        if (data.agents) {
          for (const agentCfg of data.agents) {
            // Avoid duplicates if already added from executives
            if (!allAgents.find((a) => a.id === agentCfg.id)) {
              // Try to determine team from teams data
              const teamId =
                data.teams?.find((t) =>
                  t.agents?.includes(agentCfg.id),
                )?.id ?? '';
              allAgents.push(
                agentConfigToAgent(agentCfg, teamId, deskIdx++),
              );
            }
          }
        }

        setAgents(allAgents);
      }
    } catch {
      // State API not available yet
    }

    setLoading(false);
  }, [router, setAgents, setTeams, setProviders, setProjects]);

  // Check onboarding + load state on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Also request full state via WebSocket when connected
  useEffect(() => {
    if (connected) {
      send({ type: 'request_state', payload: null });
    }
  }, [connected, send]);

  // Show loading spinner until initial check is done
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Loading workspace...</p>
        </div>
      </div>
    );
  }

  const renderMainContent = () => {
    switch (activeView) {
      case 'office':
        return <OfficeFloor />;
      case 'list':
        return <AgentListView />;
      case 'org':
        return <OrgChart />;
      default:
        return <OfficeFloor />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-950 overflow-hidden">
      {/* Header */}
      <Header
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        onToggleChat={() => setChatCollapsed(!chatCollapsed)}
      />

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Team Switcher (far left) */}
        <TeamSwitcher />

        {/* Project Sidebar */}
        <ProjectSidebar collapsed={sidebarCollapsed} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* View Tabs */}
          <div className="px-4 pt-2">
            <ViewTabs
              tabs={VIEW_TABS}
              activeTab={activeView}
              onChange={setActiveView}
            />
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-4">
            {renderMainContent()}
          </div>
        </div>

        {/* Agent Detail Panel (shown when agent selected) */}
        {selectedAgent && <AgentDetailPanel />}

        {/* Chat Panel (right side) */}
        {!chatCollapsed && <ChatPanel />}
      </div>
    </div>
  );
}
