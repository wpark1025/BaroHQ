'use client';

import { useState } from 'react';
import { Search, Filter, CheckCircle, XCircle, Clock, AlertTriangle, ChevronDown } from 'lucide-react';

interface Approval {
  id: string;
  action: string;
  description: string;
  requester: string;
  approver: string;
  status: 'pending' | 'approved' | 'rejected' | 'escalated';
  context: Record<string, string>;
  createdAt: string;
  resolvedAt?: string;
}

const STATUS_CONFIG: Record<string, { icon: typeof Clock; color: string; bg: string }> = {
  pending: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  approved: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/20' },
  rejected: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20' },
  escalated: { icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-500/20' },
};

export default function ApprovalQueue() {
  const [approvals] = useState<Approval[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filteredApprovals = approvals.filter((a) => {
    const matchesSearch =
      !search ||
      a.action.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase()) ||
      a.requester.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    const matchesAction = actionFilter === 'all' || a.action === actionFilter;
    return matchesSearch && matchesStatus && matchesAction;
  });

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const selectAll = () => {
    const pendingIds = filteredApprovals.filter((a) => a.status === 'pending').map((a) => a.id);
    setSelectedIds(new Set(pendingIds));
  };

  const actionTypes = Array.from(new Set(approvals.map((a) => a.action)));

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <h2 className="text-lg font-semibold text-slate-100">Approval Queue</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 w-48"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 hover:bg-slate-700"
          >
            <Filter className="h-4 w-4" />
            <ChevronDown className={`h-3 w-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800 bg-slate-900/50">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="escalated">Escalated</option>
          </select>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200"
          >
            <option value="all">All Actions</option>
            {actionTypes.map((a) => (
              <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
      )}

      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between px-4 py-2 bg-blue-500/10 border-b border-slate-800">
          <span className="text-xs text-blue-400">{selectedIds.size} selected</span>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 px-2.5 py-1 bg-green-500/20 text-green-400 rounded text-xs hover:bg-green-500/30">
              <CheckCircle className="h-3 w-3" /> Approve All
            </button>
            <button className="flex items-center gap-1 px-2.5 py-1 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30">
              <XCircle className="h-3 w-3" /> Reject All
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto">
        {filteredApprovals.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <CheckCircle className="h-12 w-12 mb-3 opacity-50" />
            <p className="text-sm">No approvals to show</p>
          </div>
        ) : (
          <div>
            <div className="flex items-center px-4 py-2 border-b border-slate-800 bg-slate-900/30">
              <button onClick={selectAll} className="text-xs text-slate-500 hover:text-slate-300">
                Select all pending
              </button>
            </div>
            <div className="divide-y divide-slate-800">
              {filteredApprovals.map((approval) => {
                const cfg = STATUS_CONFIG[approval.status] || STATUS_CONFIG.pending;
                const Icon = cfg.icon;
                const isPending = approval.status === 'pending';

                return (
                  <div key={approval.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800/50">
                    {isPending && (
                      <input
                        type="checkbox"
                        checked={selectedIds.has(approval.id)}
                        onChange={() => toggleSelection(approval.id)}
                        className="h-4 w-4 rounded border-slate-600 bg-slate-800"
                      />
                    )}
                    {!isPending && <div className="w-4" />}
                    <div className={`p-1.5 rounded ${cfg.bg}`}>
                      <Icon className={`h-4 w-4 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">
                        {approval.action.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-slate-400 truncate">{approval.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">{approval.requester}</p>
                      <p className="text-xs text-slate-600">{new Date(approval.createdAt).toLocaleDateString()}</p>
                    </div>
                    {isPending && (
                      <div className="flex items-center gap-1">
                        <button className="p-1 text-green-400 hover:bg-green-500/20 rounded">
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-red-400 hover:bg-red-500/20 rounded">
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
