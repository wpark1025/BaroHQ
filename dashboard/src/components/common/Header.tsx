'use client';

import { useState } from 'react';
import {
  Bell,
  Plus,
  PanelLeftOpen,
  PanelRightOpen,
  ChevronDown,
} from 'lucide-react';
import UsageBar from './UsageBar';
import AdapterStatus from './AdapterStatus';
import { useAgentStore } from '@/store/useAgentStore';
import { useTeamStore } from '@/store/useTeamStore';
import { useApprovalStore } from '@/store/approvalStore';
import { useBudgetStore } from '@/store/budgetStore';

interface HeaderProps {
  onToggleSidebar?: () => void;
  onToggleChat?: () => void;
}

export default function Header({ onToggleSidebar, onToggleChat }: HeaderProps) {
  const [showNewMenu, setShowNewMenu] = useState(false);

  const selectedTeam = useAgentStore((s) => s.selectedTeam);
  const usage = useAgentStore((s) => s.usage);
  const teams = useTeamStore((s) => s.teams);
  const pendingApprovals = useApprovalStore((s) => s.getPendingCount());
  const budget = useBudgetStore((s) => s.budget);

  // Determine team name for breadcrumb
  const activeTeam = selectedTeam
    ? teams.find((t) => t.id === selectedTeam)
    : null;
  const teamLabel = activeTeam?.name ?? 'All Teams';

  // Token usage from store or budget
  const tokenUsed = usage?.tokens ?? 0;
  const tokenLimit = budget?.monthlyLimit ?? 100000;

  return (
    <div className="h-11 bg-slate-900 border-b border-slate-800 flex items-center px-3 gap-3 shrink-0">
      {/* Sidebar toggle */}
      <button
        onClick={onToggleSidebar}
        className="text-slate-500 hover:text-slate-300 transition-colors"
      >
        <PanelLeftOpen className="w-4 h-4" />
      </button>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm">
        <span className="text-slate-400 font-medium">BaroHQ</span>
        <span className="text-slate-700">/</span>
        <span className="text-slate-300 font-bold">{teamLabel}</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Token Usage */}
      <UsageBar used={tokenUsed} limit={tokenLimit} />

      {/* Provider Health */}
      <AdapterStatus />

      {/* Approval Bell */}
      <button className="relative p-1.5 text-slate-500 hover:text-slate-300 transition-colors">
        <Bell className="w-4 h-4" />
        {pendingApprovals > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-3.5 bg-red-500 rounded-full text-[8px] text-white font-bold flex items-center justify-center px-0.5">
            {pendingApprovals}
          </span>
        )}
      </button>

      {/* New Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowNewMenu(!showNewMenu)}
          className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-sm transition-colors"
        >
          <Plus className="w-3 h-3" />
          New
          <ChevronDown className="w-3 h-3" />
        </button>

        {showNewMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowNewMenu(false)}
            />
            <div className="absolute top-full right-0 mt-1 w-44 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 z-50 animate-fade-in">
              {[
                'New Agent',
                'New Project',
                'New Task',
                'New Team',
                'New Channel',
              ].map((item) => (
                <button
                  key={item}
                  onClick={() => setShowNewMenu(false)}
                  className="w-full px-3 py-1.5 text-left text-xs text-slate-300 hover:bg-slate-700 hover:text-slate-100 transition-colors"
                >
                  {item}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Chat toggle */}
      <button
        onClick={onToggleChat}
        className="text-slate-500 hover:text-slate-300 transition-colors"
      >
        <PanelRightOpen className="w-4 h-4" />
      </button>
    </div>
  );
}
