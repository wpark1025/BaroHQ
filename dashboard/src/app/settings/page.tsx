'use client';

import { useState } from 'react';
import {
  Settings, Plug, Server, DollarSign, ListChecks, Shield, CreditCard,
} from 'lucide-react';
import { ProviderManager } from '@/components/providers/ProviderManager';
import { McpManager } from '@/components/mcp/McpManager';
import { BudgetPanel } from '@/components/budget/BudgetPanel';
import { GovernancePanel } from '@/components/governance/GovernancePanel';
import { useGovernanceStore } from '@/store/governanceStore';

type Section = 'general' | 'providers' | 'mcp' | 'budget' | 'tasks' | 'governance' | 'license';

const SECTIONS: { key: Section; label: string; icon: React.ReactNode }[] = [
  { key: 'general', label: 'General', icon: <Settings size={16} /> },
  { key: 'providers', label: 'Providers', icon: <Plug size={16} /> },
  { key: 'mcp', label: 'MCP Connections', icon: <Server size={16} /> },
  { key: 'budget', label: 'Budget', icon: <DollarSign size={16} /> },
  { key: 'tasks', label: 'Tasks', icon: <ListChecks size={16} /> },
  { key: 'governance', label: 'Governance', icon: <Shield size={16} /> },
  { key: 'license', label: 'License & Subscription', icon: <CreditCard size={16} /> },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<Section>('general');
  const rules = useGovernanceStore((s) => s.rules);

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight mb-6">Settings</h1>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-56 shrink-0">
            <nav className="space-y-1">
              {SECTIONS.map((section) => (
                <button
                  key={section.key}
                  onClick={() => setActiveSection(section.key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded transition-colors ${
                    activeSection === section.key
                      ? 'bg-slate-800 text-slate-100'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {section.icon}
                  {section.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {activeSection === 'general' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-slate-200">General Settings</h2>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Organization Name</label>
                    <input
                      type="text"
                      defaultValue="BaroHQ"
                      className="w-full max-w-md px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Default Timezone</label>
                    <select className="w-full max-w-md px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 focus:outline-none focus:border-blue-500">
                      <option>UTC</option>
                      <option>America/New_York</option>
                      <option>America/Los_Angeles</option>
                      <option>Europe/London</option>
                      <option>Asia/Tokyo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Theme</label>
                    <div className="flex items-center gap-3">
                      <button className="px-4 py-2 bg-slate-800 border-2 border-blue-500 rounded text-sm text-slate-200">
                        Dark
                      </button>
                      <button className="px-4 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-500 cursor-not-allowed">
                        Light (Coming Soon)
                      </button>
                    </div>
                  </div>
                  <div className="pt-3">
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded transition-colors">
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'providers' && <ProviderManager />}

            {activeSection === 'mcp' && <McpManager />}

            {activeSection === 'budget' && <BudgetPanel />}

            {activeSection === 'tasks' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-slate-200">Task Settings</h2>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Default Board View</label>
                    <select className="w-full max-w-md px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 focus:outline-none focus:border-blue-500">
                      <option value="kanban">Kanban</option>
                      <option value="list">List</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between max-w-md">
                    <div>
                      <p className="text-sm font-medium text-slate-300">Auto-assign tasks</p>
                      <p className="text-xs text-slate-500">Automatically assign tasks to available agents</p>
                    </div>
                    <button className="w-10 h-5 bg-blue-600 rounded-full relative transition-colors">
                      <span className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between max-w-md">
                    <div>
                      <p className="text-sm font-medium text-slate-300">Require story point estimates</p>
                      <p className="text-xs text-slate-500">Tasks must have story points before moving to sprint</p>
                    </div>
                    <button className="w-10 h-5 bg-slate-700 rounded-full relative transition-colors">
                      <span className="absolute left-0.5 top-0.5 w-4 h-4 bg-slate-400 rounded-full transition-transform" />
                    </button>
                  </div>
                  <div className="pt-3">
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded transition-colors">
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'governance' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-slate-200">Governance Settings</h2>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Default Enforcement Level</label>
                    <select className="w-full max-w-md px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 focus:outline-none focus:border-blue-500">
                      <option value="block">Block</option>
                      <option value="warn">Warn</option>
                      <option value="log">Log</option>
                      <option value="off">Off</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between max-w-md">
                    <div>
                      <p className="text-sm font-medium text-slate-300">Require approval for overrides</p>
                      <p className="text-xs text-slate-500">Overriding a blocked rule requires approval</p>
                    </div>
                    <button className="w-10 h-5 bg-blue-600 rounded-full relative transition-colors">
                      <span className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform" />
                    </button>
                  </div>
                  <div className="pt-3">
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded transition-colors">
                      Save Changes
                    </button>
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-slate-300 mt-6">Active Rules ({rules.filter((r) => r.status === 'active').length})</h3>
                <GovernancePanel rules={rules} onEdit={() => {}} onViewHistory={() => {}} />
              </div>
            )}

            {activeSection === 'license' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-slate-200">License & Subscription</h2>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-slate-100">Enterprise Plan</h3>
                      <p className="text-sm text-slate-400">Unlimited agents, teams, and projects</p>
                    </div>
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded border border-green-500/30">
                      Active
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-6 mb-6">
                    <div className="bg-slate-800 rounded-lg p-4">
                      <p className="text-xs text-slate-500 uppercase tracking-wide">Seats</p>
                      <p className="text-xl font-bold text-slate-100 mt-1">12 / 50</p>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-4">
                      <p className="text-xs text-slate-500 uppercase tracking-wide">Renewal Date</p>
                      <p className="text-xl font-bold text-slate-100 mt-1">Jan 1, 2027</p>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-4">
                      <p className="text-xs text-slate-500 uppercase tracking-wide">Monthly Cost</p>
                      <p className="text-xl font-bold text-slate-100 mt-1">$2,400</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded transition-colors">
                      Manage Subscription
                    </button>
                    <button className="px-4 py-2 border border-slate-700 text-slate-300 hover:border-slate-600 text-sm font-medium rounded transition-colors">
                      View Invoices
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
