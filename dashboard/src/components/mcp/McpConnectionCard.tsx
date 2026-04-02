'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Wrench, Globe, Users, User, Power } from 'lucide-react';
import { McpConnection, McpConnectionStatus } from '@/lib/types';
import { useMcpStore } from '@/store/useMcpStore';

const STATUS_BADGE: Record<string, string> = {
  [McpConnectionStatus.Connected]: 'bg-green-500/10 text-green-400 border-green-500/30',
  [McpConnectionStatus.Disconnected]: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
  [McpConnectionStatus.Error]: 'bg-red-500/10 text-red-400 border-red-500/30',
  [McpConnectionStatus.Connecting]: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
};

const STATUS_DOT: Record<string, string> = {
  [McpConnectionStatus.Connected]: 'bg-green-400',
  [McpConnectionStatus.Disconnected]: 'bg-slate-500',
  [McpConnectionStatus.Error]: 'bg-red-400',
  [McpConnectionStatus.Connecting]: 'bg-yellow-400',
};

const SCOPE_ICON: Record<string, React.ReactNode> = {
  global: <Globe size={10} className="text-blue-400" />,
  team: <Users size={10} className="text-green-400" />,
  agent: <User size={10} className="text-purple-400" />,
};

interface McpConnectionCardProps {
  connection: McpConnection;
}

export function McpConnectionCard({ connection }: McpConnectionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const toggleConnection = useMcpStore((s) => s.toggleConnection);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center">
              <Wrench size={16} className="text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-200">{connection.name}</h3>
                <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded border ${STATUS_BADGE[connection.status]}`}>
                  {connection.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{connection.description}</p>
            </div>
          </div>
          <button
            onClick={() => toggleConnection(connection.id)}
            className={`relative w-10 h-5 rounded-full transition-colors ${
              connection.status === McpConnectionStatus.Connected ? 'bg-green-600' : 'bg-slate-700'
            }`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                connection.status === McpConnectionStatus.Connected ? 'right-0.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        {/* Quick stats */}
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Wrench size={10} />
            {connection.tools.length} tools
          </span>
          <span className="flex items-center gap-1">
            {SCOPE_ICON[connection.scope]}
            {connection.scope}
          </span>
          <span className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[connection.status]}`} />
            {connection.status === McpConnectionStatus.Connected ? 'Healthy' : 'Offline'}
          </span>
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 mt-3 text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {expanded ? 'Hide details' : 'Show details'}
        </button>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-slate-800 p-4 space-y-3 animate-fade-in">
          {/* Transport info */}
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">Transport</p>
            <p className="text-xs text-slate-300">{connection.transport}</p>
          </div>

          {/* URL/Config */}
          {connection.config.url && (
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">URL</p>
              <p className="text-xs text-slate-300 font-mono break-all">{connection.config.url}</p>
            </div>
          )}
          {connection.config.command && (
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">Command</p>
              <p className="text-xs text-slate-300 font-mono">
                {connection.config.command} {connection.config.args?.join(' ')}
              </p>
            </div>
          )}

          {/* Tools list */}
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-2">Tools</p>
            <div className="space-y-1">
              {connection.tools.map((tool) => (
                <div key={tool.name} className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                  <div>
                    <p className="text-xs text-slate-300 font-mono">{tool.name}</p>
                    <p className="text-[10px] text-slate-500">{tool.description}</p>
                  </div>
                  <span className={`w-1.5 h-1.5 rounded-full ${tool.enabled ? 'bg-green-400' : 'bg-slate-500'}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Health */}
          <div className="text-xs text-slate-500">
            Last health check: {new Date(connection.lastHealthCheck).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}
