'use client';

import { useState } from 'react';
import { Save, Trash2, ChevronDown } from 'lucide-react';
import type { Agent } from '@/lib/types';
import { useAgentStore } from '@/store/useAgentStore';
import { useProviderStore } from '@/store/useProviderStore';
import { useMcpStore } from '@/store/useMcpStore';
import { PROVIDER_PRESETS } from '@/lib/constants';

interface AgentSettingsProps {
  agent: Agent;
  onClose: () => void;
}

export default function AgentSettings({ agent, onClose }: AgentSettingsProps) {
  const { updateAgent, removeAgent } = useAgentStore();
  const { providers } = useProviderStore();
  const { connections } = useMcpStore();

  const [name, setName] = useState(agent.name);
  const [role, setRole] = useState(agent.role);
  const [modelTier, setModelTier] = useState(agent.modelTier);
  const [providerId, setProviderId] = useState(agent.providerId);
  const [mcpConns, setMcpConns] = useState<string[]>(agent.mcpConnections);
  const [confirmRetire, setConfirmRetire] = useState(false);

  const displayProviders = providers.length > 0
    ? providers.map((p) => ({ value: p.id, label: p.name }))
    : PROVIDER_PRESETS.map((p) => ({ value: p.type, label: p.name }));

  const handleSave = () => {
    updateAgent(agent.id, {
      name,
      role,
      modelTier,
      providerId,
      mcpConnections: mcpConns,
    });
    onClose();
  };

  const handleRetire = () => {
    if (confirmRetire) {
      removeAgent(agent.id);
      onClose();
    } else {
      setConfirmRetire(true);
    }
  };

  const toggleMcp = (connId: string) => {
    setMcpConns((prev) =>
      prev.includes(connId)
        ? prev.filter((id) => id !== connId)
        : [...prev, connId]
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-5 max-w-md w-full">
      <h2 className="text-lg font-bold text-slate-100 mb-4">Agent Settings</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Role
          </label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Provider
          </label>
          <div className="relative">
            <select
              value={providerId}
              onChange={(e) => setProviderId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 focus:outline-none focus:border-blue-500 appearance-none pr-8"
            >
              <option value="">Select provider...</option>
              {displayProviders.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Model Tier
          </label>
          <div className="flex gap-2">
            {['opus', 'sonnet', 'haiku'].map((tier) => (
              <button
                key={tier}
                onClick={() => setModelTier(tier)}
                className={`
                  px-3 py-1.5 rounded text-xs font-medium transition-colors
                  ${
                    modelTier === tier
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }
                `}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            MCP Connections
          </label>
          <div className="space-y-1.5">
            {connections.length > 0 ? (
              connections.map((conn) => (
                <label
                  key={conn.id}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={mcpConns.includes(conn.id)}
                    onChange={() => toggleMcp(conn.id)}
                    className="rounded border-slate-600"
                  />
                  <span className="text-xs text-slate-300">{conn.name}</span>
                </label>
              ))
            ) : (
              <p className="text-xs text-slate-600">
                No MCP connections configured.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-800">
        <button
          onClick={handleRetire}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
            confirmRetire
              ? 'bg-red-600 text-white hover:bg-red-500'
              : 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
          }`}
        >
          <Trash2 className="w-3 h-3" />
          {confirmRetire ? 'Confirm Retire' : 'Retire Agent'}
        </button>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded transition-colors"
          >
            <Save className="w-3 h-3" />
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
