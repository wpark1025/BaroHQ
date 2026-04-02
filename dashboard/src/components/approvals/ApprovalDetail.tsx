'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, MessageSquare, Clock, User, Shield } from 'lucide-react';

interface ApprovalDetailProps {
  approval: {
    id: string;
    action: string;
    description: string;
    requester: string;
    approver: string;
    status: 'pending' | 'approved' | 'rejected' | 'escalated';
    context: Record<string, string>;
    options?: { label: string; value: string }[];
    createdAt: string;
  };
  onApprove: (id: string, comment: string) => void;
  onReject: (id: string, comment: string) => void;
  onClose: () => void;
}

export default function ApprovalDetail({ approval, onApprove, onReject, onClose }: ApprovalDetailProps) {
  const [comment, setComment] = useState('');
  const isPending = approval.status === 'pending' || approval.status === 'escalated';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-yellow-400" />
            <h3 className="text-lg font-semibold text-slate-100">Approval Request</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-xl leading-none">&times;</button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <span className="px-2.5 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-medium">
              {approval.action.replace(/_/g, ' ')}
            </span>
          </div>

          <p className="text-sm text-slate-200">{approval.description}</p>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-slate-500" />
              <div>
                <p className="text-xs text-slate-500">Requester</p>
                <p className="text-slate-300">{approval.requester}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-500" />
              <div>
                <p className="text-xs text-slate-500">Requested</p>
                <p className="text-slate-300">{new Date(approval.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {Object.keys(approval.context).length > 0 && (
            <div className="bg-slate-800/50 rounded-lg p-3 space-y-1">
              <p className="text-xs font-medium text-slate-400 mb-2">Context</p>
              {Object.entries(approval.context).map(([key, value]) => (
                <div key={key} className="flex justify-between text-xs">
                  <span className="text-slate-500">{key}:</span>
                  <span className="text-slate-300">{value}</span>
                </div>
              ))}
            </div>
          )}

          {approval.options && approval.options.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-400 mb-2">Recommended Actions</p>
              <div className="space-y-1">
                {approval.options.map((opt) => (
                  <div key={opt.value} className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-lg text-sm text-slate-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                    {opt.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {isPending && (
            <div>
              <label className="flex items-center gap-1.5 text-xs text-slate-400 mb-1.5">
                <MessageSquare className="h-3.5 w-3.5" />
                Comment (optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={2}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                placeholder="Add a comment..."
              />
            </div>
          )}
        </div>

        {isPending && (
          <div className="flex items-center justify-end gap-2 p-4 border-t border-slate-800">
            <button
              onClick={() => onReject(approval.id, comment)}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors"
            >
              <XCircle className="h-4 w-4" />
              Reject
            </button>
            <button
              onClick={() => onApprove(approval.id, comment)}
              className="flex items-center gap-1.5 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium hover:bg-green-500/30 transition-colors"
            >
              <CheckCircle className="h-4 w-4" />
              Approve
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
