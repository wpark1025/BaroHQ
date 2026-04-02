'use client';

import { useState } from 'react';
import { Search, Play, AlertCircle, CheckCircle, Clock, Zap, DollarSign, ChevronRight } from 'lucide-react';

interface RunRecord {
  id: string;
  agentId: string;
  team: string;
  provider: string;
  providerType: string;
  model: string;
  modelTier: string;
  status: 'success' | 'error' | 'rate_limited' | 'budget_exceeded';
  durationMs: number;
  usage: { inputTokens: number; outputTokens: number; costUsd: number };
  projectId?: string;
  taskId?: string;
  mcpToolsUsed: string[];
  timestamp: string;
  errorMessage?: string;
}

const STATUS_CONFIG = {
  success: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/20' },
  error: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/20' },
  rate_limited: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  budget_exceeded: { icon: DollarSign, color: 'text-orange-400', bg: 'bg-orange-500/20' },
};

export default function RunHistoryPanel() {
  const [runs] = useState<RunRecord[]>([]);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredRuns = runs.filter((r) => {
    const matchesSearch =
      !search ||
      r.agentId.toLowerCase().includes(search.toLowerCase()) ||
      r.provider.toLowerCase().includes(search.toLowerCase()) ||
      r.model.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <h2 className="text-lg font-semibold text-slate-100">Run History</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search runs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 w-56"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200"
          >
            <option value="all">All Status</option>
            <option value="success">Success</option>
            <option value="error">Error</option>
            <option value="rate_limited">Rate Limited</option>
            <option value="budget_exceeded">Budget Exceeded</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {filteredRuns.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <Play className="h-12 w-12 mb-3 opacity-50" />
            <p className="text-sm">No run records yet</p>
            <p className="text-xs mt-1">Execution records will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filteredRuns.map((run) => {
              const cfg = STATUS_CONFIG[run.status];
              const StatusIcon = cfg.icon;
              const isExpanded = expandedId === run.id;

              return (
                <div key={run.id}>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : run.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800/50 text-left"
                  >
                    <div className={`p-1.5 rounded ${cfg.bg}`}>
                      <StatusIcon className={`h-4 w-4 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-200">{run.agentId}</span>
                        <span className="text-xs text-slate-500">{run.id}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-slate-400">{run.provider}</span>
                        <span className="text-xs text-slate-500">{run.model}</span>
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Zap className="h-3 w-3" />
                          {run.durationMs}ms
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <DollarSign className="h-3 w-3" />
                          ${run.usage.costUsd.toFixed(4)}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-slate-600">{new Date(run.timestamp).toLocaleString()}</span>
                    <ChevronRight className={`h-4 w-4 text-slate-600 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-3 ml-12 space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-500">Team:</span>
                          <span className="ml-2 text-slate-300">{run.team}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Model Tier:</span>
                          <span className="ml-2 text-slate-300">{run.modelTier}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Input Tokens:</span>
                          <span className="ml-2 text-slate-300">{run.usage.inputTokens.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Output Tokens:</span>
                          <span className="ml-2 text-slate-300">{run.usage.outputTokens.toLocaleString()}</span>
                        </div>
                        {run.projectId && (
                          <div>
                            <span className="text-slate-500">Project:</span>
                            <span className="ml-2 text-slate-300">{run.projectId}</span>
                          </div>
                        )}
                        {run.taskId && (
                          <div>
                            <span className="text-slate-500">Task:</span>
                            <span className="ml-2 text-slate-300">{run.taskId}</span>
                          </div>
                        )}
                      </div>
                      {run.mcpToolsUsed.length > 0 && (
                        <div className="text-xs">
                          <span className="text-slate-500">MCP Tools:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {run.mcpToolsUsed.map((tool) => (
                              <span key={tool} className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400">
                                {tool}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {run.errorMessage && (
                        <div className="text-xs text-red-400 bg-red-500/10 rounded p-2">{run.errorMessage}</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
