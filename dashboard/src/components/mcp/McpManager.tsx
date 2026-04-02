'use client';

import { useState } from 'react';
import { Plus, Search, Server, Wrench } from 'lucide-react';
import { useMcpStore } from '@/store/mcpStore';
import { McpConnectionCard } from '@/components/mcp/McpConnectionCard';
import { AddMcpModal } from '@/components/mcp/AddMcpModal';
import { McpToolBrowser } from '@/components/mcp/McpToolBrowser';
import { McpConnectionStatus } from '@/lib/types';

export function McpManager() {
  const { connections, presets, searchQuery, setSearchQuery, filterCategory, setFilterCategory, getFilteredConnections } = useMcpStore();
  const [showAdd, setShowAdd] = useState(false);
  const [showToolBrowser, setShowToolBrowser] = useState(false);

  const filtered = getFilteredConnections();
  const connectedCount = connections.filter((c) => c.status === McpConnectionStatus.Connected).length;
  const totalTools = connections.reduce((sum, c) => sum + c.tools.length, 0);

  const categories = Array.from(new Set(presets.map((p) => p.category)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-200">MCP Connections</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowToolBrowser(!showToolBrowser)}
            className="flex items-center gap-2 px-3 py-1.5 border border-slate-700 text-slate-300 hover:border-slate-600 text-xs rounded transition-colors"
          >
            <Wrench size={12} />
            Browse Tools
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded transition-colors"
          >
            <Plus size={14} />
            Add Connection
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <Server size={14} className="text-blue-400" />
            <span className="text-xs text-slate-500">Connections</span>
          </div>
          <p className="text-xl font-bold text-slate-100">{connections.length}</p>
          <p className="text-xs text-slate-500">{connectedCount} connected</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <Wrench size={14} className="text-green-400" />
            <span className="text-xs text-slate-500">Tools Available</span>
          </div>
          <p className="text-xl font-bold text-slate-100">{totalTools}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-slate-500">Categories</span>
          </div>
          <p className="text-xl font-bold text-slate-100">{categories.length}</p>
        </div>
      </div>

      {/* Search & category tabs */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search connections..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-900 border border-slate-700 rounded text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              filterCategory === 'all' ? 'bg-slate-800 text-slate-200' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                filterCategory === cat ? 'bg-slate-800 text-slate-200' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tool browser */}
      {showToolBrowser && (
        <McpToolBrowser />
      )}

      {/* Connection cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((conn) => (
          <McpConnectionCard key={conn.id} connection={conn} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center">
          <Server size={24} className="text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No connections found</p>
        </div>
      )}

      {showAdd && <AddMcpModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}
