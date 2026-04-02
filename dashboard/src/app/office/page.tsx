'use client';

import { useState } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import TeamSwitcher from '@/components/office/TeamSwitcher';
import ProjectSidebar from '@/components/common/ProjectSidebar';
import Header from '@/components/common/Header';
import OfficeFloor from '@/components/office/OfficeFloor';
import AgentListView from '@/components/agents/AgentListView';
import OrgChart from '@/components/office/OrgChart';
import ChatPanel from '@/components/chat/ChatPanel';
import ViewTabs from '@/components/common/ViewTabs';
import OfflineOverlay from '@/components/common/OfflineOverlay';

const VIEW_TABS = [
  { id: 'office', label: 'Office' },
  { id: 'list', label: 'List' },
  { id: 'org', label: 'Org Chart' },
];

export default function OfficePage() {
  const { connected } = useWebSocket();
  const [activeView, setActiveView] = useState('office');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chatCollapsed, setChatCollapsed] = useState(false);

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

        {/* Chat Panel (right side) */}
        {!chatCollapsed && <ChatPanel />}
      </div>
    </div>
  );
}
