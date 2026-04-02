'use client';

import { useState } from 'react';
import { Search, Filter, Clock, User, FileText, ChevronDown } from 'lucide-react';

interface AuditEntry {
  id: string;
  action: string;
  actor: string;
  target: string;
  details: string;
  timestamp: string;
}

const ACTION_COLORS: Record<string, string> = {
  create: 'bg-green-500/20 text-green-400',
  update: 'bg-blue-500/20 text-blue-400',
  delete: 'bg-red-500/20 text-red-400',
  approve: 'bg-emerald-500/20 text-emerald-400',
  reject: 'bg-orange-500/20 text-orange-400',
  login: 'bg-purple-500/20 text-purple-400',
  default: 'bg-slate-500/20 text-slate-400',
};

function getActionColor(action: string): string {
  const key = Object.keys(ACTION_COLORS).find((k) => action.toLowerCase().includes(k));
  return ACTION_COLORS[key || 'default'];
}

export default function AuditPanel() {
  const [entries] = useState<AuditEntry[]>([]);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredEntries = entries.filter((e) => {
    const matchesSearch =
      !search ||
      e.action.toLowerCase().includes(search.toLowerCase()) ||
      e.actor.toLowerCase().includes(search.toLowerCase()) ||
      e.target.toLowerCase().includes(search.toLowerCase()) ||
      e.details.toLowerCase().includes(search.toLowerCase());
    const matchesAction = actionFilter === 'all' || e.action.includes(actionFilter);
    return matchesSearch && matchesAction;
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <h2 className="text-lg font-semibold text-slate-100">Audit Trail</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search audit log..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 w-64"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 hover:bg-slate-700"
          >
            <Filter className="h-4 w-4" />
            Filters
            <ChevronDown className={`h-3 w-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800 bg-slate-900/50">
          <label className="text-xs text-slate-400">Action:</label>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200"
          >
            <option value="all">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="approve">Approve</option>
            <option value="reject">Reject</option>
          </select>
        </div>
      )}

      <div className="flex-1 overflow-auto">
        {filteredEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <FileText className="h-12 w-12 mb-3 opacity-50" />
            <p className="text-sm">No audit entries yet</p>
            <p className="text-xs mt-1">Actions will be logged here automatically</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filteredEntries.map((entry) => (
              <div key={entry.id} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-800/50">
                <div className="mt-0.5">
                  <Clock className="h-4 w-4 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getActionColor(entry.action)}`}>
                      {entry.action}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <User className="h-3 w-3" />
                      {entry.actor}
                    </span>
                  </div>
                  <p className="text-sm text-slate-200">{entry.target}</p>
                  {entry.details && <p className="text-xs text-slate-500 mt-0.5">{entry.details}</p>}
                </div>
                <span className="text-xs text-slate-600 whitespace-nowrap">
                  {new Date(entry.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
