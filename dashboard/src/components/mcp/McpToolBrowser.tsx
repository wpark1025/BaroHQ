'use client';

import { useState } from 'react';
import { Search, Wrench, Server } from 'lucide-react';
import { useMcpStore } from '@/store/useMcpStore';

export function McpToolBrowser() {
  const allTools = useMcpStore((s) => s.getAllTools());
  const [search, setSearch] = useState('');

  const filtered = search
    ? allTools.filter(
        (t) =>
          t.tool.name.toLowerCase().includes(search.toLowerCase()) ||
          t.tool.description.toLowerCase().includes(search.toLowerCase()) ||
          t.connectionName.toLowerCase().includes(search.toLowerCase())
      )
    : allTools;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Wrench size={14} className="text-blue-400" />
          Tool Browser ({allTools.length} tools)
        </h3>
        <div className="relative w-64">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tools..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="space-y-1 max-h-64 overflow-y-auto">
        {filtered.map((item, i) => (
          <div
            key={`${item.connectionId}-${item.tool.name}-${i}`}
            className="flex items-center gap-3 p-2.5 rounded hover:bg-slate-800/50 transition-colors"
          >
            <div className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center shrink-0">
              <Wrench size={10} className="text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-200">{item.tool.name}</span>
                <span className={`w-1.5 h-1.5 rounded-full ${item.tool.enabled ? 'bg-green-400' : 'bg-slate-500'}`} />
              </div>
              <p className="text-[10px] text-slate-500 truncate">{item.tool.description}</p>
            </div>
            <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-800 rounded text-[10px] text-slate-400 shrink-0">
              <Server size={8} />
              {item.connectionName}
            </span>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-6 text-center text-xs text-slate-500">No tools found</div>
        )}
      </div>
    </div>
  );
}
