'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useAgentStore } from '@/store/useAgentStore';
import TeamSwitcher from '@/components/office/TeamSwitcher';
import ProjectSidebar from '@/components/common/ProjectSidebar';
import Header from '@/components/common/Header';
import OfficeFloor from '@/components/office/OfficeFloor';
import AgentListView from '@/components/agents/AgentListView';
import OrgChart from '@/components/office/OrgChart';
import ChatPanel from '@/components/chat/ChatPanel';
import ViewTabs from '@/components/common/ViewTabs';
import OfflineOverlay from '@/components/common/OfflineOverlay';
import AgentDetailPanel from '@/components/agents/AgentDetailPanel';

const VIEW_TABS = [
  { id: 'office', label: 'Office' },
  { id: 'list', label: 'List' },
  { id: 'org', label: 'Org Chart' },
];

export default function OfficePage() {
  const { connected, send } = useWebSocket();
  const router = useRouter();
  const [activeView, setActiveView] = useState('office');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chatCollapsed, setChatCollapsed] = useState(false);
  const [checkedOnboarding, setCheckedOnboarding] = useState(false);
  const selectedAgent = useAgentStore((s) => s.selectedAgent);

  // Check onboarding status and request state on mount
  useEffect(() => {
    let cancelled = false;

    async function checkConfig() {
      try {
        const res = await fetch('http://localhost:3001/api/config', {
          cache: 'no-store',
        });
        if (res.ok) {
          const config = await res.json();
          if (!config.onboardingComplete) {
            router.replace('/onboarding');
            return;
          }
        }
      } catch {
        // Bridge not available, allow page to render with offline overlay
      }
      if (!cancelled) {
        setCheckedOnboarding(true);
      }
    }

    checkConfig();
    return () => { cancelled = true; };
  }, [router]);

  // Request full state when connected
  useEffect(() => {
    if (connected) {
      send({ type: 'request_state', payload: null });
    }
  }, [connected, send]);

  // Don't render until onboarding check is complete
  if (!checkedOnboarding) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950">
        <div className="text-slate-500 text-sm">Loading...</div>
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
      {!connected && <OfflineOverlay />}

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
