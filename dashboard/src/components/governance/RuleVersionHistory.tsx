'use client';

import { X, RotateCcw } from 'lucide-react';
import type { GovernanceRule } from '@/lib/types';
import { useGovernanceStore } from '@/store/useGovernanceStore';

interface RuleVersionHistoryProps {
  rule: GovernanceRule;
  onClose: () => void;
}

export function RuleVersionHistory({ rule, onClose }: RuleVersionHistoryProps) {
  const { updateRule } = useGovernanceStore();

  const handleRollback = (version: number) => {
    const entry = rule.history.find((h) => h.version === version);
    if (!entry) return;

    updateRule(rule.id, {
      content: entry.content,
      version: entry.version,
      updatedAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
          <h2 className="font-bold text-slate-100">
            Version History: {rule.name}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {[...rule.history].reverse().map((entry) => {
            const isCurrent = entry.version === rule.version;
            return (
              <div
                key={entry.version}
                className={`border rounded-lg p-3 ${
                  isCurrent ? 'border-blue-500/50 bg-blue-500/5' : 'border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-300">
                      v{entry.version}
                    </span>
                    {isCurrent && (
                      <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">
                        Current
                      </span>
                    )}
                  </div>
                  {!isCurrent && (
                    <button
                      onClick={() => handleRollback(entry.version)}
                      className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-amber-400 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Rollback
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 mb-1.5">{entry.changeNote}</p>

                <div className="text-[10px] text-slate-600 flex items-center gap-2">
                  <span>By: {entry.changedBy}</span>
                  <span>{new Date(entry.changedAt).toLocaleDateString()}</span>
                </div>

                <pre className="text-[10px] text-slate-500 bg-slate-800 rounded p-2 mt-2 max-h-24 overflow-y-auto whitespace-pre-wrap font-mono">
                  {entry.content.substring(0, 200)}{entry.content.length > 200 ? '...' : ''}
                </pre>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
