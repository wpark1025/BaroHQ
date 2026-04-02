'use client';

import { useState } from 'react';
import { Bell, CheckCircle, XCircle, Clock, AlertTriangle, ChevronRight } from 'lucide-react';
import { useApprovalStore } from '@/store/approvalStore';
import { ApprovalStatus } from '@/lib/types';

const STATUS_STYLES: Record<string, { icon: typeof Clock; color: string; bg: string; label: string }> = {
  [ApprovalStatus.Pending]: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/20', label: 'Pending' },
  [ApprovalStatus.Approved]: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/20', label: 'Approved' },
  [ApprovalStatus.Rejected]: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20', label: 'Rejected' },
  [ApprovalStatus.Expired]: { icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-500/20', label: 'Expired' },
};

export default function ApprovalPanel() {
  const approvals = useApprovalStore((s) => s.approvals);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const pending = approvals.filter((a) => a.status === ApprovalStatus.Pending || a.status === ApprovalStatus.Expired);
  const resolved = approvals.filter((a) => a.status === ApprovalStatus.Approved || a.status === ApprovalStatus.Rejected);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-slate-100">Approvals</h2>
          {pending.length > 0 && (
            <span className="flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-red-500 text-white text-xs font-bold">
              {pending.length}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {approvals.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <Bell className="h-12 w-12 mb-3 opacity-50" />
            <p className="text-sm">No approval requests</p>
            <p className="text-xs mt-1">Protected actions will appear here for review</p>
          </div>
        ) : (
          <div>
            {pending.length > 0 && (
              <div>
                <div className="px-4 py-2 text-xs font-medium text-slate-500 uppercase tracking-wider bg-slate-900/50">
                  Pending ({pending.length})
                </div>
                <div className="divide-y divide-slate-800">
                  {pending.map((approval) => {
                    const style = STATUS_STYLES[approval.status];
                    const Icon = style.icon;
                    return (
                      <button
                        key={approval.id}
                        onClick={() => setSelectedId(selectedId === approval.id ? null : approval.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800/50 text-left"
                      >
                        <div className={`p-1.5 rounded ${style.bg}`}>
                          <Icon className={`h-4 w-4 ${style.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-200 truncate">{approval.action.replace(/_/g, ' ')}</p>
                          <p className="text-xs text-slate-400 truncate">{approval.description}</p>
                          <p className="text-xs text-slate-500 mt-0.5">by {approval.requester}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs text-slate-600">{new Date(approval.createdAt).toLocaleDateString()}</span>
                          <ChevronRight className={`h-4 w-4 text-slate-600 transition-transform ${selectedId === approval.id ? 'rotate-90' : ''}`} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {resolved.length > 0 && (
              <div>
                <div className="px-4 py-2 text-xs font-medium text-slate-500 uppercase tracking-wider bg-slate-900/50">
                  Resolved ({resolved.length})
                </div>
                <div className="divide-y divide-slate-800">
                  {resolved.map((approval) => {
                    const style = STATUS_STYLES[approval.status];
                    const Icon = style.icon;
                    return (
                      <div key={approval.id} className="flex items-center gap-3 px-4 py-3 opacity-60">
                        <div className={`p-1.5 rounded ${style.bg}`}>
                          <Icon className={`h-4 w-4 ${style.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-300 truncate">{approval.action.replace(/_/g, ' ')}</p>
                          <p className="text-xs text-slate-500 truncate">{approval.description}</p>
                        </div>
                        <span className={`text-xs ${style.color}`}>{style.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
